import { IsIn } from 'class-validator';
import { CreateAdminDto } from './create-admin.dto';
import { AdminRole } from '../schemas/admin.schema';

// super_admin is deliberately excluded — that role only ever comes from
// the one-time /admin/setup bootstrap, never from this endpoint
const STAFF_ROLES = [
  AdminRole.CINEMA_ADMIN,
  AdminRole.LOUNGE_ADMIN,
  AdminRole.GYM_ADMIN,
] as const;

export class CreateStaffDto extends CreateAdminDto {
  @IsIn(STAFF_ROLES)
  role: (typeof STAFF_ROLES)[number];
}
