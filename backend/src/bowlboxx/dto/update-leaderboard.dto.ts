import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class LeaderboardEntryDto {
  @IsString()
  @IsNotEmpty()
  player: string;

  @IsInt()
  @Min(0)
  score: number;
}

export class UpdateLeaderboardDto {
  @IsString()
  @IsNotEmpty()
  subtitle: string;

  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => LeaderboardEntryDto)
  entries: LeaderboardEntryDto[];
}
