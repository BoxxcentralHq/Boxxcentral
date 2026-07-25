import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Req,
  Res,
  HttpCode,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { AdminRole } from './schemas/admin.schema';
import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
  clearAuthCookies,
} from './auth-cookies';

interface JwtUser {
  userId: string;
  email: string;
  role: string;
}

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('setup')
  async setup(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.createInitialAdmin(createAdminDto);
  }

  /** Sets httpOnly auth cookies; tokens never appear in the response body. */
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, admin } = await this.adminService.login(
      loginDto.email,
      loginDto.password,
    );
    setAuthCookies(res, accessToken, refreshToken);
    return { admin };
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const { accessToken, refreshToken, admin } =
      await this.adminService.refresh(cookies?.[REFRESH_TOKEN_COOKIE]);
    setAuthCookies(res, accessToken, refreshToken);
    return { admin };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as JwtUser;
    const result = await this.adminService.logout(user.userId);
    clearAuthCookies(res);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @Post('admins')
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @Get('admins')
  async listAdmins() {
    return this.adminService.listAdmins();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @Delete('admins/:id')
  async removeAdmin(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtUser;
    return this.adminService.removeAdmin(id, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
    const user = req.user as JwtUser;
    return this.adminService.changePassword(
      user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
