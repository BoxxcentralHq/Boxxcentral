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
  handleWebhook(
    @Headers('verif-hash') signature: string,
    @Body() payload: FlutterwaveWebhookPayload,
  ) {
    return this.paymentsService.handleWebhook(payload, signature);
  }

  /** Public: the post-payment redirect page polls this (slim response). */
  @Get(':idOrRef/verify')
  verifyStatus(@Param('idOrRef') idOrRef: string) {
    return this.paymentsService.verifyTransactionStatus(idOrRef);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.paymentsService.findAll({ page, limit, search });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @Get('analytics/monthly')
  getMonthlyRevenue() {
    return this.paymentsService.getMonthlyRevenue();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }
}
