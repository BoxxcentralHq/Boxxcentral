import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CinemaSettingsDocument = CinemaSettings & Document;

// singleton document — all pricing/slot config is admin-editable, never hardcoded
@Schema({ timestamps: true })
export class CinemaSettings {
  @Prop({ required: true, min: 0, default: 110000 })
  basePrice: number;

  @Prop({ required: true, min: 1, default: 12 })
  includedGuests: number;

  @Prop({ required: true, min: 1, default: 15 })
  maxGuests: number;

  @Prop({ required: true, min: 0, default: 10000 })
  extraSeatPrice: number;

  @Prop({ required: true, min: 1, default: 3 })
  sessionDurationHours: number;

  // Nigeria VAT, percent
  @Prop({ required: true, min: 0, max: 100, default: 7.5 })
  vatRate: number;

  @Prop({ type: [String], default: ['11:00', '15:00', '19:00'] })
  timeSlots: string[];

  @Prop({ default: true })
  bookingEnabled: boolean;
}

export const CinemaSettingsSchema =
  SchemaFactory.createForClass(CinemaSettings);
