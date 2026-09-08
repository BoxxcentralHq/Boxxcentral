import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BowlboxxController } from './bowlboxx.controller';
import { BowlboxxService } from './bowlboxx.service';
import { Leaderboard, LeaderboardSchema } from './schemas/leaderboard.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Leaderboard.name, schema: LeaderboardSchema },
    ]),
  ],
  controllers: [BowlboxxController],
  providers: [BowlboxxService],
})
export class BowlboxxModule {}
