import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  vatRate?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  rooms?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultTicketPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  screeningBufferMins?: number;
}
