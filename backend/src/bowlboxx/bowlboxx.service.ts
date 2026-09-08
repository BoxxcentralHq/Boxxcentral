import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Leaderboard, LeaderboardDocument } from './schemas/leaderboard.schema';
import { UpdateLeaderboardDto } from './dto/update-leaderboard.dto';

@Injectable()
export class BowlboxxService implements OnModuleInit {
  constructor(
    @InjectModel(Leaderboard.name)
    private leaderboardModel: Model<LeaderboardDocument>,
  ) {}

  // seed the singleton on boot so GET never 404s
  async onModuleInit() {
    await this.leaderboardModel.findOneAndUpdate(
      {},
      { $setOnInsert: {} },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  async getLeaderboard(): Promise<LeaderboardDocument> {
    const leaderboard = await this.leaderboardModel.findOne();
    if (!leaderboard) throw new NotFoundException('Leaderboard not found');
    return leaderboard;
  }

  // staff overwrite the whole board on every publish — no partial patching
  async updateLeaderboard(dto: UpdateLeaderboardDto) {
    return this.leaderboardModel.findOneAndUpdate({}, dto, {
      new: true,
      upsert: true,
    });
  }
}
