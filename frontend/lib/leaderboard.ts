"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Leaderboard, LeaderboardEntry } from "@/lib/api/types";

export const LEADERBOARD_SLOTS = 10;
const DEFAULT_SUBTITLE = "10-FRAME CHALLENGE";
const LEADERBOARD_KEY = ["bowlboxx", "leaderboard"] as const;

export function defaultLeaderboardState(): Leaderboard {
  return { subtitle: DEFAULT_SUBTITLE, entries: [] };
}

export type RankedEntry = LeaderboardEntry & { rank: number };

/** Highest score first; blank rows (no player name) are dropped. */
export function rankEntries(entries: LeaderboardEntry[]): RankedEntry[] {
  return entries
    .filter((e) => e.player.trim() !== "")
    .sort((a, b) => b.score - a.score)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

/** Polls the live board — used by both the TV display and the edit form. */
export function useLeaderboard() {
  return useQuery({
    queryKey: LEADERBOARD_KEY,
    queryFn: () => api.get<Leaderboard>("/bowlboxx/leaderboard"),
    refetchInterval: 2500,
  });
}

export function usePublishLeaderboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Leaderboard) =>
      api.patch<Leaderboard>("/bowlboxx/leaderboard", body),
    onSuccess: (data) => queryClient.setQueryData(LEADERBOARD_KEY, data),
  });
}
