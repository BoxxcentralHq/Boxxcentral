import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CinemaController } from './cinema.controller';
import { CinemaService } from './cinema.service';
import {
  CinemaSettings,
  CinemaSettingsSchema,
} from './schemas/cinema-settings.schema';
import { Movie, MovieSchema } from './schemas/movie.schema';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CinemaSettings.name, schema: CinemaSettingsSchema },
      { name: Movie.name, schema: MovieSchema },
    ]),
    AdminModule,
  ],
  controllers: [CinemaController],
  providers: [CinemaService],
  exports: [CinemaService],
})
export class CinemaModule {}
