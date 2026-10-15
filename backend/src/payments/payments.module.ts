import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import {
  GymSubscription,
  GymSubscriptionSchema,
} from '../gym/schemas/gym-subscription.schema';
import {
  Screening,
  ScreeningSchema,
} from '../screenings/schemas/screening.schema';
import {
  TicketOrder,
  TicketOrderSchema,
} from '../screenings/schemas/ticket-order.schema';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: GymSubscription.name, schema: GymSubscriptionSchema },
      { name: Screening.name, schema: ScreeningSchema },
      { name: TicketOrder.name, schema: TicketOrderSchema },
    ]),
    AdminModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService, MongooseModule],
})
export class PaymentsModule {}
