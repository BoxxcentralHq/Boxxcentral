import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  includedGuests?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxGuests?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  extraSeatPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  sessionDurationHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  vatRate?: number;

  @IsOptional()
  @IsArray()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { each: true })
  timeSlots?: string[];

  @IsOptional()
  @IsBoolean()
  bookingEnabled?: boolean;
}
