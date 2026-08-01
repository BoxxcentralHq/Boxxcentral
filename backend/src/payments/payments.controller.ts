import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';
import { RolesGuard } from '../admin/guards/roles.guard';
import { Roles } from '../admin/decorators/roles.decorator';
import { AdminRole } from '../admin/schemas/admin.schema';
import type { FlutterwaveWebhookPayload } from '../flutterwave/types/flutterwave.types';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /** Public: Flutterwave calls this. Auth is the verif-hash signature. */
  @Post('webhook/flutterwave')
  @HttpCode(200)
  async handleWebhook(
    @Headers('verif-hash') signature: string,
    @Body() payload: FlutterwaveWebhookPayload,
  ) {
    const result = await this.paymentsService.handleWebhook(payload, signature);
    return { message: 'Webhook processed', data: result };
  }

  @Get(':idOrRef/verify')
  async verifyStatus(@Param('idOrRef') idOrRef: string) {
    const result = await this.paymentsService.verifyTransactionStatus(idOrRef);
    return { message: 'Payment status fetched', data: result };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    const result = await this.paymentsService.findAll({ page, limit, search });
    return { message: 'Payments fetched', data: result };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @Get('analytics/monthly')
  async getMonthlyRevenue() {
    const revenue = await this.paymentsService.getMonthlyRevenue();
    return { message: 'Revenue fetched', data: revenue };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const payment = await this.paymentsService.findOne(id);
    return { message: 'Payment fetched', data: payment };
  }
}
