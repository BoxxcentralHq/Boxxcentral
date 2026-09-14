import type { LeaderboardEntry } from "@/lib/api/types";
import { LEADERBOARD_SLOTS } from "@/lib/leaderboard";

export type FormEntry = { id: string; player: string; score: number | null };

export function padToSlots(entries: LeaderboardEntry[]): FormEntry[] {
  return Array.from({ length: LEADERBOARD_SLOTS }, (_, i) => ({
    id: `slot-${i}`,
    player: entries[i]?.player ?? "",
    score: entries[i]?.score ?? null,
  }));
}

export function stripBlanks(rows: FormEntry[]): LeaderboardEntry[] {
  return rows
    .filter((r) => r.player.trim() !== "" && r.score !== null)
    .map((r) => ({ player: r.player.trim(), score: r.score as number }));
}
