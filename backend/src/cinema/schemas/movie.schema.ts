import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MovieDocument = Movie & Document;

// catalog content only — movies are chosen on arrival, never booked
@Schema({ timestamps: true })
export class Movie {
  @Prop({ required: true })
  title: string;

  @Prop()
  synopsis?: string;

  @Prop()
  genre?: string;

  @Prop({ min: 1 })
  durationMins?: number;

  @Prop()
  posterUrl?: string;

  @Prop()
  posterPublicId?: string;

  @Prop({ default: true })
  visible: boolean;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
