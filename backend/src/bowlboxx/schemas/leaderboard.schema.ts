import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeaderboardDocument = Leaderboard & Document;

@Schema({ _id: false })
export class LeaderboardEntry {
  @Prop({ required: true })
  player: string;

  @Prop({ required: true, min: 0 })
  score: number;
}

const LeaderboardEntrySchema = SchemaFactory.createForClass(LeaderboardEntry);

@Schema({ _id: false })
export class LeaderboardBoard {
  @Prop({ required: true })
  subtitle: string;

  @Prop({ type: [LeaderboardEntrySchema], default: [] })
  entries: LeaderboardEntry[];
}

const LeaderboardBoardSchema = SchemaFactory.createForClass(LeaderboardBoard);

@Schema({ timestamps: true })
export class Leaderboard {
  @Prop({
    type: LeaderboardBoardSchema,
    default: () => ({ subtitle: '6-FRAME CHALLENGE', entries: [] }),
  })
  sixFrame: LeaderboardBoard;

  @Prop({
    type: LeaderboardBoardSchema,
    default: () => ({ subtitle: '10-FRAME CHALLENGE', entries: [] }),
  })
  tenFrame: LeaderboardBoard;
}

export const LeaderboardSchema = SchemaFactory.createForClass(Leaderboard);
