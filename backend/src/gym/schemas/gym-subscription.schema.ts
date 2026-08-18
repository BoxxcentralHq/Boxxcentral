import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum GymSubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export type GymSubscriptionDocument = GymSubscription & Document;

// a purchased pass — not a recurring subscription. One Flutterwave charge
// buys `durationDays` of access; the member pays again to renew.
@Schema({ timestamps: true })
export class GymSubscription {
  @Prop({ required: true, unique: true })
  subscriptionRef: string;

  @Prop({ type: Types.ObjectId, ref: 'GymPlan', required: true })
  planId: Types.ObjectId;

  // snapshot of the plan at purchase time — a later plan edit must never
  // rewrite what this member actually paid for
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

  // both set once, when payment succeeds — endDate is never extended
  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;
}

export const GymSubscriptionSchema =
  SchemaFactory.createForClass(GymSubscription);
