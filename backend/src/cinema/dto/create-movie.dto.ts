import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  synopsis?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  // multipart form fields arrive as strings
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMins?: number;
}
