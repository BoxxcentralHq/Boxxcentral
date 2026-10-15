import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Screening, ScreeningDocument } from './schemas/screening.schema';
import {
  TicketOrder,
  TicketOrderDocument,
  TicketOrderStatus,
} from './schemas/ticket-order.schema';
import { CreateScreeningDto } from './dto/create-screening.dto';
import { UpdateScreeningDto } from './dto/update-screening.dto';
import { CreateTicketOrderDto } from './dto/create-ticket-order.dto';
import {
  addDays,
  isCalendarDate,
  lagosDateTime,
  lagosToday,
} from './lagos-time';
import { Movie, MovieDocument } from '../cinema/schemas/movie.schema';
import { CinemaSettingsDocument } from '../cinema/schemas/cinema-settings.schema';
import { CinemaService } from '../cinema/cinema.service';
import {
  Payment,
  PaymentDocument,
  PaymentStatus,
} from '../payments/schemas/payment.schema';
import {
  FlutterwaveService,
  generateTxRef,
} from '../flutterwave/flutterwave.service';

export const ORDER_HOLD_MS = 30 * 60 * 1000;
export const LISTING_DAYS = 7;

type Schedule = Pick<
  CreateScreeningDto,
  'movieId' | 'date' | 'time' | 'screen'
>;

const SCHEDULE_FIELDS: (keyof Schedule)[] = [
  'movieId',
  'date',
  'time',
  'screen',
];

export function seatsLeft(
  screening: Pick<Screening, 'capacity' | 'seatsHeld' | 'seatsSold'>,
) {
  return Math.max(
    0,
    screening.capacity - screening.seatsHeld - screening.seatsSold,
  );
}

@Injectable()
export class ScreeningsService {
  constructor(
    @InjectModel(Screening.name)
    private screeningModel: Model<ScreeningDocument>,
    @InjectModel(TicketOrder.name)
    private ticketOrderModel: Model<TicketOrderDocument>,
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private cinemaService: CinemaService,
    private flutterwaveService: FlutterwaveService,
    private configService: ConfigService,
  ) {}

  async listUpcoming() {
    await this.expireStaleOrders();

    const today = lagosToday();
    const screenings = await this.screeningModel
      .find({
        visible: true,
        date: { $gte: today, $lt: addDays(today, LISTING_DAYS) },
      })
      .sort({ startsAt: 1 });
    if (screenings.length === 0) return [];

    const movies = await this.movieModel
      .find({
        _id: { $in: [...new Set(screenings.map((s) => String(s.movieId)))] },
        visible: true,
      })
      .sort({ createdAt: -1 })
      .lean();

    return movies.map((movie) => ({
      ...movie,
      showtimes: screenings
        .filter((s) => String(s.movieId) === String(movie._id))
        .map((s) => ({
          _id: s._id,
          date: s.date,
          time: s.time,
          screen: s.screen,
          ticketPrice: s.ticketPrice,
          seatsLeft: seatsLeft(s),
        })),
    }));
  }

  async listAll(from?: string) {
    return this.screeningModel
      .find({ date: { $gte: from ?? lagosToday() } })
      .sort({ startsAt: 1 })
      .populate('movieId', 'title durationMins');
  }

  async create(dto: CreateScreeningDto) {
    const settings = await this.cinemaService.getSettings();
    const times = await this.resolveSchedule(dto, settings);
    return this.screeningModel.create({
      ...dto,
      ...times,
      ticketPrice: dto.ticketPrice ?? settings.defaultTicketPrice,
    });
  }

  async update(id: string, dto: UpdateScreeningDto) {
    const screening = await this.findScreening(id);
    const committed = screening.seatsHeld + screening.seatsSold;

    const scheduleChanged = SCHEDULE_FIELDS.some(
      (field) =>
        dto[field] !== undefined &&
        String(dto[field]) !== String(screening[field]),
    );
    if (scheduleChanged) {
      if (committed > 0) {
        throw new ConflictException(
          "Tickets have been sold for this screening — its movie, date, time, and screen can't change",
        );
      }
      const next: Schedule = {
        movieId: dto.movieId ?? String(screening.movieId),
        date: dto.date ?? screening.date,
        time: dto.time ?? screening.time,
        screen: dto.screen ?? screening.screen,
      };
      const settings = await this.cinemaService.getSettings();
      const times = await this.resolveSchedule(next, settings, screening._id);
      Object.assign(screening, {
        ...next,
        movieId: new Types.ObjectId(next.movieId),
        ...times,
      });
    }

    if (dto.capacity !== undefined) {
      if (dto.capacity < committed) {
        throw new ConflictException(
          `Capacity can't go below the ${committed} seats already taken`,
        );
      }
      screening.capacity = dto.capacity;
    }
    if (dto.ticketPrice !== undefined) screening.ticketPrice = dto.ticketPrice;
    if (dto.visible !== undefined) screening.visible = dto.visible;

    return screening.save();
  }

  async remove(id: string) {
    const screening = await this.findScreening(id);
    if (screening.seatsHeld + screening.seatsSold > 0) {
      throw new ConflictException(
        'Tickets have been sold for this screening — hide it instead of deleting it',
      );
    }
    await screening.deleteOne();
    return { message: 'Screening removed' };
  }

  async createOrder(screeningId: string, dto: CreateTicketOrderDto) {
    if (!isValidObjectId(screeningId)) {
      throw new NotFoundException('Screening not found');
    }
    await this.expireStaleOrders();

    const held = await this.screeningModel.findOneAndUpdate(
      {
        _id: screeningId,
        visible: true,
        startsAt: { $gt: new Date() },
        $expr: {
          $lte: [
            { $add: ['$seatsHeld', '$seatsSold', dto.tickets] },
            '$capacity',
          ],
        },
      },
      { $inc: { seatsHeld: dto.tickets } },
      { new: true },
    );
    if (!held) throw await this.holdFailure(screeningId);

    let order: TicketOrderDocument | undefined;
    try {
      const [settings, movie] = await Promise.all([
        this.cinemaService.getSettings(),
        this.movieModel.findById(held.movieId),
      ]);
      if (!movie) throw new NotFoundException('Movie not found');

      const unitPrice = held.ticketPrice;
      const subtotal = unitPrice * dto.tickets;
      const vatAmount = Math.round(subtotal * (settings.vatRate / 100));
      const totalPrice = subtotal + vatAmount;
      const orderRef = generateTxRef();

      order = await this.ticketOrderModel.create({
        orderRef,
        screeningId: held._id,
        movieId: movie._id,
        movieTitle: movie.title,
        date: held.date,
        time: held.time,
        screen: held.screen,
        tickets: dto.tickets,
        unitPrice,
        subtotal,
        vatAmount,
        totalPrice,
        guestName: dto.guestName,
        guestEmail: dto.guestEmail,
        guestPhone: dto.guestPhone,
      });

      await this.paymentModel.create({
        reference: orderRef,
        amount: totalPrice,
        status: PaymentStatus.PENDING,
        category: 'ticket_payment',
        ticketOrderId: order._id,
      });

      const frontendUrl = (
        this.configService.get<string>('FRONTEND_URL') ??
        'http://localhost:3000'
      ).split(',')[0];

      const payment = await this.flutterwaveService.initializePayment({
        tx_ref: orderRef,
        amount: totalPrice,
        currency: 'NGN',
        redirect_url: `${frontendUrl}/payment/confirm`,
        meta: { ticketOrderId: String(order._id), experience: 'filmboxx' },
        customer: {
          email: dto.guestEmail,
          phonenumber: dto.guestPhone,
          name: dto.guestName,
        },
        customizations: {
          title: 'FilmBoxx Tickets',
          description: `${movie.title} — ${held.screen}, ${held.date} at ${held.time}`,
        },
      });

      return {
        order: {
          orderRef,
          movieTitle: movie.title,
          date: held.date,
          time: held.time,
          screen: held.screen,
          tickets: dto.tickets,
          unitPrice,
          subtotal,
          vatAmount,
          totalPrice,
        },
        paymentLink: payment.link,
      };
    } catch (error) {
      if (order) {
        await this.releaseOrder(order._id);
      } else {
        await this.screeningModel.updateOne(
          { _id: held._id },
          { $inc: { seatsHeld: -dto.tickets } },
        );
      }
      throw error;
    }
  }

  async expireStaleOrders() {
    const stale = await this.ticketOrderModel.find(
      {
        status: TicketOrderStatus.PENDING,
        createdAt: { $lt: new Date(Date.now() - ORDER_HOLD_MS) },
      },
      { _id: 1 },
    );
    for (const order of stale) {
      await this.releaseOrder(order._id);
    }
  }

  private async releaseOrder(id: Types.ObjectId) {
    const order = await this.ticketOrderModel.findOneAndUpdate(
      { _id: id, status: TicketOrderStatus.PENDING },
      { status: TicketOrderStatus.EXPIRED },
      { new: true },
    );
    if (!order) return;

    await this.screeningModel.updateOne(
      { _id: order.screeningId },
      { $inc: { seatsHeld: -order.tickets } },
    );
    await this.paymentModel.updateMany(
      { ticketOrderId: order._id, status: PaymentStatus.PENDING },
      { status: PaymentStatus.FAILED },
    );
  }

  private async findScreening(id: string) {
    const screening = isValidObjectId(id)
      ? await this.screeningModel.findById(id)
      : null;
    if (!screening) throw new NotFoundException('Screening not found');
    return screening;
  }

  private async holdFailure(screeningId: string): Promise<HttpException> {
    const screening = await this.screeningModel.findById(screeningId);
    if (!screening || !screening.visible) {
      return new NotFoundException('Screening not found');
    }
    if (screening.startsAt <= new Date()) {
      return new BadRequestException('This screening has already started');
    }
    const left = seatsLeft(screening);
    return new ConflictException(
      left === 0
        ? 'This screening is sold out'
        : `Only ${left} ${left === 1 ? 'seat is' : 'seats are'} left for this screening`,
    );
  }

  private async resolveSchedule(
    schedule: Schedule,
    settings: CinemaSettingsDocument,
    excludeId?: Types.ObjectId,
  ) {
    if (!settings.rooms.includes(schedule.screen)) {
      throw new BadRequestException(
        `screen must be one of: ${settings.rooms.join(', ')}`,
      );
    }

    const movie = isValidObjectId(schedule.movieId)
      ? await this.movieModel.findById(schedule.movieId)
      : null;
    if (!movie) throw new NotFoundException('Movie not found');
    if (!movie.durationMins) {
      throw new BadRequestException(
        "Set the movie's duration before scheduling it",
      );
    }

    if (!isCalendarDate(schedule.date)) {
      throw new BadRequestException(`${schedule.date} is not a real date`);
    }
    const startsAt = lagosDateTime(schedule.date, schedule.time);
    if (startsAt <= new Date()) {
      throw new BadRequestException('A screening must start in the future');
    }
    const endsAt = new Date(
      startsAt.getTime() +
        (movie.durationMins + settings.screeningBufferMins) * 60_000,
    );

    const clash = await this.screeningModel.findOne({
      screen: schedule.screen,
      startsAt: { $lt: endsAt },
      endsAt: { $gt: startsAt },
      ...(excludeId && { _id: { $ne: excludeId } }),
    });
    if (clash) {
      throw new ConflictException(
        `${schedule.screen} is already booked for a screening at ${clash.time} on ${clash.date}`,
      );
    }

    return { startsAt, endsAt };
  }
}
