import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
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
import { FlutterwaveService } from '../flutterwave/flutterwave.service';
import { FlutterwaveWebhookPayload } from '../flutterwave/types/flutterwave.types';
import { EmailService } from '../email/email.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
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

  // single source of truth for confirming payments
  async handleWebhook(payload: FlutterwaveWebhookPayload, signature: string) {
    if (!this.flutterwaveService.validateSignature(signature)) {
      this.logger.error('[Webhook] Invalid signature received.');
      throw new BadRequestException('Invalid webhook signature');
    }

    const txRef = payload?.data?.tx_ref || payload?.txRef;
    const status = payload?.data?.status || payload?.status;
    const gatewayId = payload?.data?.id || payload?.id;

    if (!txRef) {
      this.logger.warn('[Webhook] Ignored: no transaction reference found.');
      return { status: 'ignored', message: 'No transaction reference found' };
    }

    this.logger.log(`[Webhook] ${txRef} | gateway status: ${status}`);

    const payment = await this.paymentModel.findOne({ reference: txRef });
    if (!payment) {
      this.logger.error(`[Webhook] No ledger record for reference: ${txRef}`);
      throw new NotFoundException(`Payment record for ${txRef} not found`);
    }

    if (status !== 'successful') {
      await this.paymentModel.findByIdAndUpdate(payment._id, {
        status: PaymentStatus.FAILED,
        transactionId: gatewayId?.toString(),
        gatewayResponse: payload?.data || payload,
      });
      return { status: 'failed', reference: txRef, gatewayStatus: status };
    }

    await this.paymentModel.findByIdAndUpdate(payment._id, {
      status: PaymentStatus.SUCCESS,
      transactionId: gatewayId?.toString(),
      gatewayResponse: payload?.data || payload,
    });

    if (payment.bookingId) {
      const booking = await this.bookingModel.findByIdAndUpdate(
        payment.bookingId,
        { status: BookingStatus.RESERVED },
        { new: true },
      );

      // A failed email must never make the webhook fail — Flutterwave
      // would retry and we'd double-process.
      if (booking) {
        try {
          await this.emailService.sendBookingConfirmation({
            guestName: booking.guestName,
            guestEmail: booking.guestEmail,
            bookingRef: booking.bookingRef,
            experience: booking.experience,
            date: booking.date,
            timeSlot: booking.timeSlot,
            guests: booking.guests,
            totalPrice: booking.totalPrice,
          });
        } catch (emailError) {
          this.logger.error(
            `[Webhook] Email dispatch failed for ${txRef}: ${(emailError as Error).message}`,
          );
        }
      }
    }

    this.logger.log(
      `[Webhook] SUCCESS: ${txRef} — ledger and booking updated.`,
    );
    return { status: 'success', reference: txRef };
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
