import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ScreeningDocument = Screening & Document;

@Schema({ timestamps: true })
export class Screening {
  @Prop({ type: Types.ObjectId, ref: 'Movie', required: true })
  movieId: Types.ObjectId;

  @Prop({ type: String, required: true })
  date: string;

  @Prop({ type: String, required: true })
  time: string;

  @Prop({ type: String, required: true })
  screen: string;

  @Prop({ type: Date, required: true })
  startsAt: Date;

  @Prop({ type: Date, required: true })
  endsAt: Date;

  @Prop({ type: Number, required: true, min: 0 })
  ticketPrice: number;

  @Prop({ type: Number, required: true, min: 1 })
  capacity: number;

  @Prop({ type: Number, default: 0, min: 0 })
  seatsHeld: number;

  @Prop({ type: Number, default: 0, min: 0 })
  seatsSold: number;

  @Prop({ type: Boolean, default: true })
  visible: boolean;
}

export const ScreeningSchema = SchemaFactory.createForClass(Screening);

ScreeningSchema.index({ screen: 1, startsAt: 1 });
ScreeningSchema.index({ date: 1 });
