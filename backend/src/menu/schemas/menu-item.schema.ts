import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const MENU_CATEGORIES = [
  'Food',
  'Pastries',
  'Pizza',
  'Signature Cocktail',
  'Classic Cocktails',
  'Mocktail',
  'Smoothie',
  'Juices',
  'Shots',
  'Drinks',
] as const;
export type MenuCategory = (typeof MENU_CATEGORIES)[number];

export type MenuItemDocument = MenuItem & Document;

@Schema({ timestamps: true })
export class MenuItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: MENU_CATEGORIES })
  category: MenuCategory;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true })
  description: string;

  @Prop()
  imageUrl?: string;

  // internal Cloudinary bookkeeping — never sent to the frontend
  @Prop({ select: false })
  imagePublicId?: string;

  @Prop()
  imageAlt?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: true })
  visible: boolean;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
