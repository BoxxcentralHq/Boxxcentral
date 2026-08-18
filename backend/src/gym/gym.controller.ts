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
import { GymService } from './gym.service';
import { CreateGymPlanDto } from './dto/create-gym-plan.dto';
import { UpdateGymPlanDto } from './dto/update-gym-plan.dto';
import { CreateGymSubscriptionDto } from './dto/create-gym-subscription.dto';
import { GymSubscriptionStatus } from './schemas/gym-subscription.schema';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';
import { RolesGuard } from '../admin/guards/roles.guard';
import { Roles } from '../admin/decorators/roles.decorator';
import { AdminRole } from '../admin/schemas/admin.schema';

@Controller('gym')
export class GymController {
  constructor(private readonly gymService: GymService) {}

  // public: GymBoxx page pricing carousel
  @Get('plans')
  async listVisiblePlans() {
    const plans = await this.gymService.listVisiblePlans();
    return { message: 'Gym plans fetched', data: plans };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.GYM_ADMIN)
  @Get('plans/all')
  async listAllPlans() {
    const plans = await this.gymService.listAllPlans();
    return { message: 'Gym plans fetched', data: plans };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.GYM_ADMIN)
  @Post('plans')
  async createPlan(@Body() dto: CreateGymPlanDto) {
    const plan = await this.gymService.createPlan(dto);
    return { message: 'Gym plan added', data: plan };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.GYM_ADMIN)
  @Patch('plans/:id')
  async updatePlan(@Param('id') id: string, @Body() dto: UpdateGymPlanDto) {
    const plan = await this.gymService.updatePlan(id, dto);
    return { message: 'Gym plan updated', data: plan };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.GYM_ADMIN)
  @Delete('plans/:id')
  async removePlan(@Param('id') id: string) {
    const result = await this.gymService.removePlan(id);
    return { message: result.message, data: null };
  }

  // public: guest subscribes and gets the payment link
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('subscriptions')
  async createSubscription(@Body() dto: CreateGymSubscriptionDto) {
    const result = await this.gymService.createSubscription(dto);
    return {
      message: 'Subscription created — redirecting to payment',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.GYM_ADMIN)
  @Get('subscriptions')
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: GymSubscriptionStatus,
  ) {
    const result = await this.gymService.findAll({ page, limit, status });
    return { message: 'Subscriptions fetched', data: result };
  }

  // front-desk lookup: is this person's membership currently active?
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.GYM_ADMIN)
  @Get('subscriptions/search')
  async search(@Query('query') query: string) {
    const results = await this.gymService.search(query ?? '');
    return { message: 'Subscriptions fetched', data: results };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.GYM_ADMIN)
  @Patch('subscriptions/:id/cancel')
  async cancel(@Param('id') id: string) {
    const subscription = await this.gymService.cancel(id);
    return { message: 'Subscription cancelled', data: subscription };
  }
}
