import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Admin, AdminDocument, AdminRole } from './schemas/admin.schema';
import { CreateAdminDto } from './dto/create-admin.dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  role: AdminRole;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async issueTokens(admin: AdminDocument): Promise<AuthTokens> {
    const payload = {
      sub: String(admin._id),
      email: admin.email,
      role: admin.role,
    };

    const accessToken = this.jwtService.sign(payload); // 15m, JWT_SECRET (module config)
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    admin.refreshTokenHash = await argon2.hash(refreshToken);
    await admin.save();

    return { accessToken, refreshToken };
  }

  private toSafeAdmin(admin: AdminDocument) {
    return {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };
  }

  async createInitialAdmin(dto: CreateAdminDto) {
    const adminCount = await this.adminModel.estimatedDocumentCount();
    if (adminCount > 0) {
      throw new ForbiddenException(
        'Setup has already been completed. Ask a super admin to create accounts.',
      );
    }

    const passwordHash = await argon2.hash(dto.password);

    const savedAdmin = await new this.adminModel({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
    }).save();

    return {
      _id: savedAdmin._id,
      name: savedAdmin.name,
      email: savedAdmin.email,
      role: savedAdmin.role,
    };
  }

  async createAdmin(dto: CreateAdminDto) {
    const existing = await this.adminModel.findOne({ email: dto.email });
    if (existing) {
      throw new ForbiddenException('An admin with this email already exists');
    }

    const passwordHash = await argon2.hash(dto.password);

    const saved = await new this.adminModel({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: AdminRole.CINEMA_ADMIN,
    }).save();

    return this.toSafeAdmin(saved);
  }

  async listAdmins() {
    const admins = await this.adminModel
      .find()
      .sort({ createdAt: 1 })
      .select('name email role createdAt');
    return admins.map((a) => this.toSafeAdmin(a));
  }

  async removeAdmin(id: string, requesterId: string) {
    if (id === requesterId) {
      throw new ForbiddenException('You cannot remove your own account');
    }

    const admin = await this.adminModel.findById(id);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    if (admin.role === AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('The super admin account cannot be removed');
    }

    await admin.deleteOne();
    return { message: `${admin.name} removed` };
  }

  async login(email: string, passwordPlain: string) {
    const admin = await this.adminModel.findOne({ email });
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(
      admin.passwordHash,
      passwordPlain,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(admin);

    return {
      ...tokens,
      admin: this.toSafeAdmin(admin),
    };
  }

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const admin = await this.adminModel
      .findById(payload.sub)
      .select('+refreshTokenHash');
    if (!admin?.refreshTokenHash) {
      throw new UnauthorizedException('Session no longer active');
    }

    const matches = await argon2.verify(admin.refreshTokenHash, refreshToken);
    if (!matches) {
      admin.refreshTokenHash = null;
      await admin.save();
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    const tokens = await this.issueTokens(admin);

    return {
      ...tokens,
      admin: this.toSafeAdmin(admin),
    };
  }

  async logout(adminId: string) {
    await this.adminModel.findByIdAndUpdate(adminId, {
      refreshTokenHash: null,
    });
    return { message: 'Logged out successfully' };
  }

  async changePassword(
    adminId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const admin = await this.adminModel.findById(adminId);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const isCurrentPasswordValid = await argon2.verify(
      admin.passwordHash,
      currentPassword,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    admin.passwordHash = await argon2.hash(newPassword);
    await admin.save();

    return { message: 'Password changed successfully' };
  }
}
