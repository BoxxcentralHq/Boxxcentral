import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Booking,
  BookingDocument,
  BookingStatus,
} from './schemas/booking.schema';
import {
  Payment,
  PaymentDocument,
  PaymentStatus,
} from '../payments/schemas/payment.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CinemaService } from '../cinema/cinema.service';
import {
  FlutterwaveService,
  TX_REF_PREFIX,
} from '../flutterwave/flutterwave.service';

// unpaid bookings release their slot after this window
const PENDING_EXPIRY_MS = 30 * 60 * 1000;

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private cinemaService: CinemaService,
    private flutterwaveService: FlutterwaveService,
    private configService: ConfigService,
  ) {}

  private generateRef(): string {
    const stamp = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${TX_REF_PREFIX}${stamp}-${rand}`;
  }

  private async expireStalePending() {
    const cutoff = new Date(Date.now() - PENDING_EXPIRY_MS);
    await this.bookingModel.updateMany(
      { status: BookingStatus.PENDING, createdAt: { $lt: cutoff } },
      { status: BookingStatus.CANCELLED },
    );
  }

  private isPastDate(date: string): boolean {
    const today = new Date().toISOString().slice(0, 10);
    return date < today;
  }

  private async setStatus(id: string, status: BookingStatus) {
    const booking = await this.bookingModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async createBooking(dto: CreateBookingDto) {
    const settings = await this.cinemaService.getSettings();

    if (!settings.bookingEnabled) {
      throw new ServiceUnavailableException(
        'Online booking is temporarily unavailable',
      );
    }
    if (!settings.timeSlots.includes(dto.timeSlot)) {
      throw new BadRequestException('Invalid time slot');
    }
    if (this.isPastDate(dto.date)) {
      throw new BadRequestException('Booking date is in the past');
    }
    if (dto.guests > settings.maxGuests) {
      throw new BadRequestException(
        `Maximum ${settings.maxGuests} guests per booking`,
      );
    }

    await this.expireStalePending();

    // price is computed here only — the client never sends amounts
    const extraGuests = Math.max(0, dto.guests - settings.includedGuests);
    const subtotal = settings.basePrice + extraGuests * settings.extraSeatPrice;
    const vatAmount = Math.round(subtotal * (settings.vatRate / 100));
    const totalPrice = subtotal + vatAmount;

    const bookingRef = this.generateRef();

    let booking: BookingDocument;
    try {
      booking = await new this.bookingModel({
        bookingRef,
        experience: 'filmboxx',
        guestName: dto.guestName,
        guestEmail: dto.guestEmail,
        guestPhone: dto.guestPhone,
        date: dto.date,
        timeSlot: dto.timeSlot,
        guests: dto.guests,
        subtotal,
        vatAmount,
        totalPrice,
        notes: dto.notes,
      }).save();
    } catch (error) {
      if ((error as { code?: number })?.code === 11000) {
        throw new ConflictException('This slot has just been booked');
      }
      throw error;
    }

    await new this.paymentModel({
      reference: bookingRef,
      amount: totalPrice,
      status: PaymentStatus.PENDING,
      bookingId: booking._id,
    }).save();

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';

    const payment = await this.flutterwaveService.initializePayment({
      tx_ref: bookingRef,
      amount: totalPrice,
      currency: 'NGN',
      redirect_url: `${frontendUrl}/filmboxx/payment-status`,
      meta: { bookingId: String(booking._id), experience: 'filmboxx' },
      customer: {
        email: dto.guestEmail,
        phonenumber: dto.guestPhone,
        name: dto.guestName,
      },
      customizations: {
        title: 'FilmBoxx Private Cinema',
        description: `Private cinema — ${dto.date} at ${dto.timeSlot}`,
      },
    });

    return {
      booking: {
        bookingRef,
        date: booking.date,
        timeSlot: booking.timeSlot,
        guests: booking.guests,
        subtotal,
        vatAmount,
        totalPrice,
      },
      paymentLink: payment.link,
    };
  }

  async getAvailability(date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('date must be YYYY-MM-DD');
    }

    const settings = await this.cinemaService.getSettings();
    await this.expireStalePending();

    const active = await this.bookingModel
      .find({
        experience: 'filmboxx',
        date,
        status: { $in: [BookingStatus.PENDING, BookingStatus.RESERVED] },
      })
      .select('timeSlot');
    const taken = new Set(active.map((b) => b.timeSlot));

    return {
      date,
      bookingEnabled: settings.bookingEnabled,
      slots: settings.timeSlots.map((time) => ({
        time,
        available: !taken.has(time) && !this.isPastDate(date),
      })),
    };
  }

  async findAll(query?: {
    page?: number;
    limit?: number;
    date?: string;
    status?: BookingStatus;
  }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;

    const filter: Record<string, unknown> = {};
    if (query?.date) filter.date = query.date;
    if (query?.status) filter.status = query.status;

    const [bookings, total] = await Promise.all([
      this.bookingModel
        .find(filter)
        .sort({ date: -1, timeSlot: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.bookingModel.countDocuments(filter),
    ]);

    return {
      bookings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async cancel(id: string) {
    return this.setStatus(id, BookingStatus.CANCELLED);
  }

  async complete(id: string) {
    return this.setStatus(id, BookingStatus.COMPLETED);
  }
}
