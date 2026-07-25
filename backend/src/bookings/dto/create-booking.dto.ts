import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  guestName: string;

  @IsEmail()
  guestEmail: string;

  @IsString()
  @IsNotEmpty()
  guestPhone: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  date: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'timeSlot must be HH:mm' })
  timeSlot: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
