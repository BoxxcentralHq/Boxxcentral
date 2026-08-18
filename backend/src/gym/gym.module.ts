import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GymController } from './gym.controller';
import { GymService } from './gym.service';
import { GymPlan, GymPlanSchema } from './schemas/gym-plan.schema';
import {
  GymSubscription,
  GymSubscriptionSchema,
} from './schemas/gym-subscription.schema';
import { PaymentsModule } from '../payments/payments.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GymPlan.name, schema: GymPlanSchema },
      { name: GymSubscription.name, schema: GymSubscriptionSchema },
    ]),
    PaymentsModule,
    AdminModule,
  ],
  controllers: [GymController],
  providers: [GymService],
})
export class GymModule {}
