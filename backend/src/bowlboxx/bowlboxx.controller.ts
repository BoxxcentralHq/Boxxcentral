import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { BowlboxxService } from './bowlboxx.service';
import { UpdateLeaderboardDto } from './dto/update-leaderboard.dto';

@Controller('bowlboxx')
export class BowlboxxController {
  constructor(private readonly bowlboxxService: BowlboxxService) {}

  // public: the TV display polls this
  @Get('leaderboard')
  async getLeaderboard() {
    const leaderboard = await this.bowlboxxService.getLeaderboard();
    return { message: 'Leaderboard fetched', data: leaderboard };
  }

  // public: no admin login for this one — it's a front-desk console, not an
  // admin surface. Throttled instead, same spirit as the contact form.
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 30 } })
  @Patch('leaderboard')
  async updateLeaderboard(@Body() dto: UpdateLeaderboardDto) {
    const leaderboard = await this.bowlboxxService.updateLeaderboard(dto);
    return { message: 'Leaderboard published', data: leaderboard };
  }
}
