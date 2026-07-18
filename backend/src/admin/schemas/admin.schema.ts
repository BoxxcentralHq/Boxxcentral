import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  CINEMA_ADMIN = 'cinema_admin',
}

export type AdminDocument = Admin & Document;

@Schema({ timestamps: true })
export class Admin {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: String, enum: AdminRole, default: AdminRole.CINEMA_ADMIN })
  role: AdminRole;

  // argon2 hash of the active refresh token; null = logged out
  @Prop({ type: String, default: null, select: false })
  refreshTokenHash: string | null;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
