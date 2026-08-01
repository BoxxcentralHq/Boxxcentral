import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum BookingStatus {
  PENDING = 'pending',
  RESERVED = 'reserved',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export const BOOKABLE_EXPERIENCES = [
  'filmboxx',
  'gymboxx',
  'bowlboxx',
  'lounge',
] as const;
export type BookableExperience = (typeof BOOKABLE_EXPERIENCES)[number];

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ required: true, unique: true })
  bookingRef: string;

  @Prop({ required: true, enum: BOOKABLE_EXPERIENCES })
  experience: BookableExperience;

  @Prop({ required: true })
  guestName: string;

  @Prop({ required: true })
  guestEmail: string;

  @Prop({ required: true })
  guestPhone: string;

  // YYYY-MM-DD
  @Prop({ required: true })
  date: string;

  // e.g. "19:00"
  @Prop({ required: true })
  timeSlot: string;

  // which physical room — e.g. "Cinema 1"; validated against CinemaSettings.rooms
  @Prop({ required: true })
  room: string;

  @Prop({ required: true, min: 1, default: 1 })
  guests: number;

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ required: true, min: 0 })
  vatAmount: number;

  // subtotal + vatAmount
  @Prop({ required: true, min: 0 })
  totalPrice: number;

  @Prop({
    type: String,
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Prop()
  notes?: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// DB-enforced double-booking guard: one active FilmBoxx booking per
// (date, timeSlot, room) — two different rooms can be booked for the same
// slot, but the same room can't be double-booked
BookingSchema.index(
  { experience: 1, date: 1, timeSlot: 1, room: 1 },
  {
    unique: true,
    partialFilterExpression: {
      experience: 'filmboxx',
      status: { $in: [BookingStatus.PENDING, BookingStatus.RESERVED] },
    },
  },
);
