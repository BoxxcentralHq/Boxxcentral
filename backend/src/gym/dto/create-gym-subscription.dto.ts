import { IsEmail, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateGymSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  memberName: string;

  @IsEmail()
  memberEmail: string;

  @IsString()
  @IsNotEmpty()
  memberPhone: string;

  @IsMongoId()
  planId: string;
}
