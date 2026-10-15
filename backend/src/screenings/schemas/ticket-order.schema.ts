import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TicketOrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  EXPIRED = 'expired',
}

export type TicketOrderDocument = TicketOrder & Document;

@Schema({ timestamps: true })
export class TicketOrder {
  @Prop({ type: String, required: true, unique: true })
  orderRef: string;

  @Prop({ type: Types.ObjectId, ref: 'Screening', required: true })
  screeningId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Movie', required: true })
  movieId: Types.ObjectId;

  @Prop({ type: String, required: true })
  movieTitle: string;

  @Prop({ type: String, required: true })
  date: string;

  @Prop({ type: String, required: true })
  time: string;

  @Prop({ type: String, required: true })
  screen: string;

  @Prop({ type: Number, required: true, min: 1 })
  tickets: number;

  @Prop({ type: Number, required: true, min: 0 })
  unitPrice: number;

  @Prop({ type: Number, required: true, min: 0 })
  subtotal: number;

  @Prop({ type: Number, required: true, min: 0 })
  vatAmount: number;

  @Prop({ type: Number, required: true, min: 0 })
  totalPrice: number;

  @Prop({ type: String, required: true })
  guestName: string;

  @Prop({ type: String, required: true })
  guestEmail: string;

  @Prop({ type: String, required: true })
  guestPhone: string;

  @Prop({
    type: String,
    enum: TicketOrderStatus,
    default: TicketOrderStatus.PENDING,
  })
  status: TicketOrderStatus;
}

export const TicketOrderSchema = SchemaFactory.createForClass(TicketOrder);

TicketOrderSchema.index({ status: 1, createdAt: 1 });
