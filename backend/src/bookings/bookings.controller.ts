import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from './schemas/booking.schema';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';
import { RolesGuard } from '../admin/guards/roles.guard';
import { Roles } from '../admin/decorators/roles.decorator';
import { AdminRole } from '../admin/schemas/admin.schema';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // public: guest creates a booking and gets the payment link
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post()
  async create(@Body() dto: CreateBookingDto) {
    const result = await this.bookingsService.createBooking(dto);
    return {
      message: 'Booking created — redirecting to payment',
      data: result,
    };
  }

  // public: slot availability for the booking form, scoped to one room
  @Get('availability')
  async availability(@Query('date') date: string, @Query('room') room: string) {
    const result = await this.bookingsService.getAvailability(date, room);
    return { message: 'Availability fetched', data: result };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CINEMA_ADMIN)
  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('date') date?: string,
    @Query('status') status?: BookingStatus,
  ) {
    const result = await this.bookingsService.findAll({
      page,
      limit,
      date,
      status,
    });
    return { message: 'Bookings fetched', data: result };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CINEMA_ADMIN)
  @Patch(':id/cancel')
  async cancel(@Param('id') id: string) {
    const booking = await this.bookingsService.cancel(id);
    return { message: 'Booking cancelled', data: booking };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CINEMA_ADMIN)
  @Patch(':id/complete')
  async complete(@Param('id') id: string) {
    const booking = await this.bookingsService.complete(id);
    return { message: 'Booking marked complete', data: booking };
  }
}
