import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ScreeningsService } from './screenings.service';
import { CreateScreeningDto } from './dto/create-screening.dto';
import { UpdateScreeningDto } from './dto/update-screening.dto';
import { CreateTicketOrderDto } from './dto/create-ticket-order.dto';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';
import { RolesGuard } from '../admin/guards/roles.guard';
import { Roles } from '../admin/decorators/roles.decorator';
import { AdminRole } from '../admin/schemas/admin.schema';

@Controller('screenings')
export class ScreeningsController {
  constructor(private readonly screeningsService: ScreeningsService) {}

  @Get()
  async listUpcoming() {
    const movies = await this.screeningsService.listUpcoming();
    return { message: 'Screenings fetched', data: movies };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CINEMA_ADMIN)
  @Get('all')
  async listAll(@Query('from') from?: string) {
    const screenings = await this.screeningsService.listAll(from);
    return { message: 'Screenings fetched', data: screenings };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CINEMA_ADMIN)
  @Post()
  async create(@Body() dto: CreateScreeningDto) {
    const screening = await this.screeningsService.create(dto);
    return { message: 'Screening added', data: screening };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CINEMA_ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateScreeningDto) {
    const screening = await this.screeningsService.update(id, dto);
    return { message: 'Screening updated', data: screening };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CINEMA_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.screeningsService.remove(id);
    return { message: result.message, data: null };
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post(':id/tickets')
  async createOrder(
    @Param('id') id: string,
    @Body() dto: CreateTicketOrderDto,
  ) {
    const result = await this.screeningsService.createOrder(id, dto);
    return {
      message: 'Seats held — redirecting to payment',
      data: result,
    };
  }
}
