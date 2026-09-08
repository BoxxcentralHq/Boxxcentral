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

@Schema({ timestamps: true })
export class Leaderboard {
  @Prop({ required: true, default: '10-FRAME CHALLENGE' })
  subtitle: string;

  @Prop({ type: [LeaderboardEntrySchema], default: [] })
  entries: LeaderboardEntry[];
}

export const LeaderboardSchema = SchemaFactory.createForClass(Leaderboard);
