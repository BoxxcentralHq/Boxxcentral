import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CinemaSettingsDocument = CinemaSettings & Document;

@Schema({ timestamps: true })
export class CinemaSettings {
  @Prop({ required: true, min: 0, max: 100, default: 7.5 })
  vatRate: number;

  @Prop({ type: [String], default: ['Cinema 1', 'Cinema 2'] })
  rooms: string[];

  @Prop({ required: true, min: 0, default: 10000 })
  defaultTicketPrice: number;

  @Prop({ required: true, min: 0, default: 30 })
  screeningBufferMins: number;
}

export const CinemaSettingsSchema =
  SchemaFactory.createForClass(CinemaSettings);
