import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum GymSubscriptionStatus {
  PENDING = 'pending',
  PAID = 'paid',
  ACTIVE = 'active',
  EXPIRED = 'expired',
}

export type GymSubscriptionDocument = GymSubscription & Document;

@Schema({ timestamps: true })
export class GymSubscription {
  @Prop({ required: true, unique: true })
  subscriptionRef: string;

  @Prop({ type: Types.ObjectId, ref: 'GymPlan', required: true })
  planId: Types.ObjectId;

  @Prop({ required: true })
  planName: string;

  @Prop({ required: true, min: 1 })
  durationDays: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true })
  memberName: string;

  @Prop({ required: true })
  memberEmail: string;

  @Prop({ required: true })
  memberPhone: string;

  @Prop({
    type: String,
    enum: GymSubscriptionStatus,
    default: GymSubscriptionStatus.PENDING,
  })
  status: GymSubscriptionStatus;

  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;
}

export const GymSubscriptionSchema =
  SchemaFactory.createForClass(GymSubscription);
