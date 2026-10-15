import { IsIn } from 'class-validator';
import { CreateAdminDto } from './create-admin.dto';
import { AdminRole } from '../schemas/admin.schema';

const STAFF_ROLES = [
  AdminRole.CINEMA_ADMIN,
  AdminRole.LOUNGE_ADMIN,
  AdminRole.GYM_ADMIN,
] as const;

export class CreateStaffDto extends CreateAdminDto {
  @IsIn(STAFF_ROLES)
  role: (typeof STAFF_ROLES)[number];
}
