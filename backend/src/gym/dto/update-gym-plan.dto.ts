import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateGymPlanDto } from './create-gym-plan.dto';

export class UpdateGymPlanDto extends PartialType(CreateGymPlanDto) {
  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}
