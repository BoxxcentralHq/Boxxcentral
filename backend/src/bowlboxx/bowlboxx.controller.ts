import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { BowlboxxService } from './bowlboxx.service';
import { UpdateLeaderboardDto } from './dto/update-leaderboard.dto';

@Controller('bowlboxx')
export class BowlboxxController {
  constructor(private readonly bowlboxxService: BowlboxxService) {}

  // public: the TV display polls this — returns both boards at once
  @Get('leaderboard')
  async getLeaderboard() {
    const leaderboard = await this.bowlboxxService.getLeaderboard();
    return { message: 'Leaderboard fetched', data: leaderboard };
  }
  
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 30 } })
  @Patch('leaderboard/:board')
  async updateBoard(
    @Param('board') board: string,
    @Body() dto: UpdateLeaderboardDto,
  ) {
    const leaderboard = await this.bowlboxxService.updateBoard(board, dto);
    return { message: 'Leaderboard published', data: leaderboard };
  }
}
