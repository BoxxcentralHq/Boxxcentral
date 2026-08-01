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
import { ContactService } from './contact.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';
import { RolesGuard } from '../admin/guards/roles.guard';
import { Roles } from '../admin/decorators/roles.decorator';
import { AdminRole } from '../admin/schemas/admin.schema';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // public: the contact form posts here
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @Post()
  async create(@Body() dto: CreateMessageDto) {
    const result = await this.contactService.create(dto);
    return { message: result.message, data: null };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('unread') unread?: string,
  ) {
    const result = await this.contactService.findAll({
      page,
      limit,
      unread: unread === 'true',
    });
    return { message: 'Messages fetched', data: result };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @Patch(':id/read')
  async markRead(@Param('id') id: string) {
    const message = await this.contactService.markRead(id);
    return { message: 'Message marked read', data: message };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.contactService.remove(id);
    return { message: result.message, data: null };
  }
}
