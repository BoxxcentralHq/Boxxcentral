import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const MAX_TICKETS_PER_ORDER = 10;

export class CreateTicketOrderDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_TICKETS_PER_ORDER)
  tickets: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  guestName: string;

  @IsEmail()
  guestEmail: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  guestPhone: string;
}
