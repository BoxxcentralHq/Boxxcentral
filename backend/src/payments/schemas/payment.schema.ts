import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class Payment {
  /** Our reference (BXX-...), generated when the payment is initiated. */
  @Prop({ required: true, unique: true })
  reference: string;

  @Prop({ unique: true, sparse: true })
  transactionId?: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ default: 'NGN' })
  currency: string;

  /** Ledger direction — revenue analytics aggregate over 'inflow'. */
  @Prop({ required: true, enum: ['inflow', 'outflow'], default: 'inflow' })
  type: string;

  @Prop({
    required: true,
    enum: ['booking_payment', 'refund'],
    default: 'booking_payment',
  })
  category: string;

  @Prop({
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Prop({ default: 'flutterwave' })
  paymentMethod: string;

  @Prop({ type: Types.ObjectId, ref: 'Booking' })
  bookingId?: Types.ObjectId;

  /** Raw gateway payload kept for dispute resolution / debugging. */
  @Prop({ type: Object })
  gatewayResponse?: Record<string, unknown>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
