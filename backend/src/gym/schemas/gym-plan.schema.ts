import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GymPlanDocument = GymPlan & Document;

// catalog content — a fixed-duration pass, paid once, no recurring billing
@Schema({ timestamps: true })
export class GymPlan {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 1 })
  durationDays: number;

  // flat, all-inclusive price — no VAT stacked on top, unlike FilmBoxx
  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop({ default: false })
  featured: boolean;

  @Prop()
  subtitle?: string;

  @Prop({ default: true })
  visible: boolean;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const GymPlanSchema = SchemaFactory.createForClass(GymPlan);
