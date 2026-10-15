import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScreeningsController } from './screenings.controller';
import { ScreeningsService } from './screenings.service';
import { Screening, ScreeningSchema } from './schemas/screening.schema';
import { TicketOrder, TicketOrderSchema } from './schemas/ticket-order.schema';
import { Movie, MovieSchema } from '../cinema/schemas/movie.schema';
import { CinemaModule } from '../cinema/cinema.module';
import { PaymentsModule } from '../payments/payments.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Screening.name, schema: ScreeningSchema },
      { name: TicketOrder.name, schema: TicketOrderSchema },
      { name: Movie.name, schema: MovieSchema },
    ]),
    CinemaModule,
    PaymentsModule,
    AdminModule,
  ],
  controllers: [ScreeningsController],
  providers: [ScreeningsService],
})
export class ScreeningsModule {}
