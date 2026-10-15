import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Payment,
  PaymentDocument,
  PaymentStatus,
} from './schemas/payment.schema';
import {
  Booking,
  BookingDocument,
  BookingStatus,
} from '../bookings/schemas/booking.schema';
import {
  GymSubscription,
  GymSubscriptionDocument,
  GymSubscriptionStatus,
} from '../gym/schemas/gym-subscription.schema';
import {
  Screening,
  ScreeningDocument,
} from '../screenings/schemas/screening.schema';
import {
  TicketOrder,
  TicketOrderDocument,
  TicketOrderStatus,
} from '../screenings/schemas/ticket-order.schema';
import { FlutterwaveService } from '../flutterwave/flutterwave.service';
import { FlutterwaveWebhookPayload } from '../flutterwave/types/flutterwave.types';
import { EmailService } from '../email/email.service';
import { WebhookResult } from './webhook-result.enum';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(GymSubscription.name)
    private gymSubscriptionModel: Model<GymSubscriptionDocument>,
    @InjectModel(TicketOrder.name)
    private ticketOrderModel: Model<TicketOrderDocument>,
    @InjectModel(Screening.name)
    private screeningModel: Model<ScreeningDocument>,
    private flutterwaveService: FlutterwaveService,
    private emailService: EmailService,
  ) {}

  async findAll(query?: { page?: number; limit?: number; search?: string }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query?.search) {
      filter.$or = [
        { reference: { $regex: query.search, $options: 'i' } },
        { transactionId: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [payments, total] = await Promise.all([
      this.paymentModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('bookingId')
        .exec(),
      this.paymentModel.countDocuments(filter),
    ]);

    return {
      payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async handleWebhook(payload: FlutterwaveWebhookPayload, signature: string) {
    if (!this.flutterwaveService.validateSignature(signature)) {
      this.logger.error('[Webhook] Invalid signature received.');
      throw new BadRequestException('Invalid webhook signature');
    }

    const txRef = payload?.data?.tx_ref || payload?.txRef;
    const gatewayId = payload?.data?.id || payload?.id;

    if (!txRef) {
      this.logger.warn('[Webhook] Ignored: no transaction reference found.');
      return {
        status: WebhookResult.IGNORED,
        message: 'No transaction reference found',
      };
    }

    const payment = await this.paymentModel.findOne({ reference: txRef });
    if (!payment) {
      this.logger.warn(`[Webhook] Ignored: no ledger record for ${txRef}`);
      return {
        status: WebhookResult.IGNORED,
        message: 'Unknown transaction reference',
      };
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      return {
        status: WebhookResult.IGNORED,
        reference: txRef,
        message: 'Already refunded',
      };
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      await this.fulfil(payment, false);
      return { status: WebhookResult.DUPLICATE, reference: txRef };
    }

    const verified = await this.flutterwaveService.verifyTransaction(
      gatewayId ? String(gatewayId) : txRef,
    );
    if (!verified) {
      throw new ServiceUnavailableException(
        'Could not verify the transaction with Flutterwave',
      );
    }
    if (verified.tx_ref !== txRef) {
      this.logger.error(
        `[Webhook] Reference mismatch: event ${txRef}, gateway ${verified.tx_ref}`,
      );
      return {
        status: WebhookResult.IGNORED,
        message: 'Transaction reference mismatch',
      };
    }

    const gatewayFields = {
      transactionId: String(verified.id),
      gatewayResponse: verified as unknown as Record<string, unknown>,
    };
    const unconfirmed = {
      _id: payment._id,
      status: { $in: [PaymentStatus.PENDING, PaymentStatus.FAILED] },
    };

    if (verified.status !== 'successful') {
      if (verified.status === 'failed') {
        await this.paymentModel.updateOne(
          { _id: payment._id, status: PaymentStatus.PENDING },
          { status: PaymentStatus.FAILED, ...gatewayFields },
        );
      }
      this.logger.log(
        `[Webhook] ${txRef} | gateway status: ${verified.status}`,
      );
      return {
        status:
          verified.status === 'failed'
            ? WebhookResult.FAILED
            : WebhookResult.PENDING,
        reference: txRef,
        gatewayStatus: verified.status,
      };
    }

    if (
      verified.currency !== payment.currency ||
      verified.amount < payment.amount
    ) {
      await this.paymentModel.updateOne(unconfirmed, {
        needsReview: true,
        reviewReason: 'amount_mismatch',
        ...gatewayFields,
      });
      this.logger.error(
        `[Webhook] ${txRef} amount mismatch: expected ${payment.amount} ${payment.currency}, ` +
          `gateway paid ${verified.amount} ${verified.currency} — flagged for review`,
      );
      return {
        status: WebhookResult.REVIEW,
        reference: txRef,
        reason: 'amount_mismatch',
      };
    }

    const claimed = await this.paymentModel.findOneAndUpdate(
      unconfirmed,
      { status: PaymentStatus.SUCCESS, ...gatewayFields },
      { new: true },
    );
    if (!claimed) {
      return { status: WebhookResult.DUPLICATE, reference: txRef };
    }

    await this.fulfil(claimed, true);
    this.logger.log(`[Webhook] SUCCESS: ${txRef}`);
    return { status: WebhookResult.SUCCESS, reference: txRef };
  }

  private async fulfil(payment: PaymentDocument, justPaid: boolean) {
    if (payment.bookingId) await this.confirmBooking(payment, justPaid);
    if (payment.subscriptionId) {
      await this.confirmSubscription(payment, justPaid);
    }
    if (payment.ticketOrderId) {
      await this.confirmTicketOrder(payment, justPaid);
    }
  }

  private async confirmTicketOrder(
    payment: PaymentDocument,
    justPaid: boolean,
  ) {
    let order = await this.ticketOrderModel.findOneAndUpdate(
      { _id: payment.ticketOrderId, status: TicketOrderStatus.PENDING },
      { status: TicketOrderStatus.PAID },
      { new: true },
    );
    if (order) {
      await this.screeningModel.updateOne(
        { _id: order.screeningId },
        { $inc: { seatsHeld: -order.tickets, seatsSold: order.tickets } },
      );
    } else if (justPaid) {
      order = await this.reseatExpiredOrder(payment);
    }
    if (!order) return;

    try {
      await this.emailService.sendTicketConfirmation({
        guestName: order.guestName,
        guestEmail: order.guestEmail,
        guestPhone: order.guestPhone,
        orderRef: order.orderRef,
        movieTitle: order.movieTitle,
        screen: order.screen,
        date: order.date,
        time: order.time,
        tickets: order.tickets,
        subtotal: order.subtotal,
        vatAmount: order.vatAmount,
        totalPrice: order.totalPrice,
      });
    } catch (emailError) {
      this.logger.error(
        `[Webhook] Email dispatch failed for ${payment.reference}: ${(emailError as Error).message}`,
      );
    }
  }

  private async reseatExpiredOrder(payment: PaymentDocument) {
    const expired = await this.ticketOrderModel.findOne({
      _id: payment.ticketOrderId,
      status: TicketOrderStatus.EXPIRED,
    });
    if (!expired) return null;

    const seated = await this.screeningModel.findOneAndUpdate(
      {
        _id: expired.screeningId,
        $expr: {
          $lte: [
            { $add: ['$seatsHeld', '$seatsSold', expired.tickets] },
            '$capacity',
          ],
        },
      },
      { $inc: { seatsSold: expired.tickets } },
    );
    if (!seated) {
      await this.paymentModel.updateOne(
        { _id: payment._id },
        { needsReview: true, reviewReason: 'sold_out' },
      );
      this.logger.error(
        `[Webhook] ${payment.reference} paid after expiry, screening sold out — flagged for review`,
      );
      return null;
    }

    const order = await this.ticketOrderModel.findOneAndUpdate(
      { _id: expired._id, status: TicketOrderStatus.EXPIRED },
      { status: TicketOrderStatus.PAID },
      { new: true },
    );
    if (!order) {
      await this.screeningModel.updateOne(
        { _id: expired.screeningId },
        { $inc: { seatsSold: -expired.tickets } },
      );
    }
    return order;
  }

  private async confirmBooking(payment: PaymentDocument, justPaid: boolean) {
    let booking = await this.bookingModel.findOneAndUpdate(
      { _id: payment.bookingId, status: BookingStatus.PENDING },
      { status: BookingStatus.RESERVED },
      { new: true },
    );

    if (!booking && justPaid) {
      try {
        booking = await this.bookingModel.findOneAndUpdate(
          { _id: payment.bookingId, status: BookingStatus.CANCELLED },
          { status: BookingStatus.RESERVED },
          { new: true },
        );
      } catch (error) {
        if ((error as { code?: number })?.code !== 11000) throw error;
        await this.paymentModel.updateOne(
          { _id: payment._id },
          { needsReview: true, reviewReason: 'slot_taken' },
        );
        this.logger.error(
          `[Webhook] ${payment.reference} paid after expiry, slot already taken — flagged for review`,
        );
        return;
      }
    }

    if (!booking) return;

    try {
      await this.emailService.sendBookingConfirmation({
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        bookingRef: booking.bookingRef,
        experience: booking.experience,
        room: booking.room,
        date: booking.date,
        timeSlot: booking.timeSlot,
        guests: booking.guests,
        subtotal: booking.subtotal,
        vatAmount: booking.vatAmount,
        totalPrice: booking.totalPrice,
      });
    } catch (emailError) {
      this.logger.error(
        `[Webhook] Email dispatch failed for ${payment.reference}: ${(emailError as Error).message}`,
      );
    }
  }

  private async confirmSubscription(
    payment: PaymentDocument,
    justPaid: boolean,
  ) {
    const revivable = justPaid
      ? [GymSubscriptionStatus.PENDING, GymSubscriptionStatus.EXPIRED]
      : [GymSubscriptionStatus.PENDING];

    const subscription = await this.gymSubscriptionModel.findOneAndUpdate(
      {
        _id: payment.subscriptionId,
        status: { $in: revivable },
        startDate: { $exists: false },
      },
      { status: GymSubscriptionStatus.PAID },
      { new: true },
    );
    if (!subscription) return;

    try {
      await this.emailService.sendMembershipPaymentReceipt({
        memberName: subscription.memberName,
        memberEmail: subscription.memberEmail,
        subscriptionRef: subscription.subscriptionRef,
        planName: subscription.planName,
        durationDays: subscription.durationDays,
        price: subscription.price,
      });
    } catch (emailError) {
      this.logger.error(
        `[Webhook] Email dispatch failed for ${payment.reference}: ${(emailError as Error).message}`,
      );
    }
  }

  // guest-facing status check — slim response, no gateway internals
  async verifyTransactionStatus(idOrRef: string) {
    let payment = await this.paymentModel.findById(idOrRef).catch(() => null);
    if (!payment) {
      payment = await this.paymentModel.findOne({ reference: idOrRef });
    }
    if (!payment) throw new NotFoundException('Payment record not found');

    const flwData = await this.flutterwaveService.verifyTransaction(
      payment.transactionId || payment.reference,
    );
    if (!flwData) {
      throw new BadRequestException(
        'The payment gateway could not find this transaction. It may be expired or cancelled.',
      );
    }

    return {
      reference: payment.reference,
      localStatus: payment.status,
      gatewayStatus: flwData.status,
      amount: flwData.amount,
      currency: flwData.currency,
      category: payment.category,
    };
  }

  findOne(id: string) {
    return this.paymentModel.findById(id).populate('bookingId').exec();
  }

  async getMonthlyRevenue(): Promise<{ month: string; revenue: number }[]> {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const results = await this.paymentModel.aggregate<{
      _id: { year: number; month: number };
      revenue: number;
    }>([
      {
        $match: {
          type: 'inflow',
          status: PaymentStatus.SUCCESS,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return results.map((r) => ({
      month: monthNames[r._id.month - 1],
      revenue: r.revenue,
    }));
  }
}
