import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Leaderboard, LeaderboardDocument } from './schemas/leaderboard.schema';
import { UpdateLeaderboardDto } from './dto/update-leaderboard.dto';

const BOARD_FIELDS = {
  'six-frame': 'sixFrame',
  'ten-frame': 'tenFrame',
} as const;

type BoardSlug = keyof typeof BOARD_FIELDS;

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

  // staff publish one board at a time — the six-frame and ten-frame games
  // run independently and finish at different times, so updating one must
  // never touch the other.
  async updateBoard(board: string, dto: UpdateLeaderboardDto) {
    const field = BOARD_FIELDS[board as BoardSlug];
    if (!field) {
      throw new BadRequestException('board must be "six-frame" or "ten-frame"');
    }
    return this.leaderboardModel.findOneAndUpdate(
      {},
      { $set: { [field]: dto } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }
}
