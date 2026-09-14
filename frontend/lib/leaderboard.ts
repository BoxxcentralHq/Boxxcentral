"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  Leaderboard,
  LeaderboardBoard,
  LeaderboardBoardSlug,
  LeaderboardEntry,
} from "@/lib/api/types";

export const LEADERBOARD_SLOTS = 6;
const LEADERBOARD_KEY = ["bowlboxx", "leaderboard"] as const;

export function defaultLeaderboardBoard(subtitle: string): LeaderboardBoard {
  return { subtitle, entries: [] };
}

export function defaultLeaderboardState(): Leaderboard {
  return {
    sixFrame: defaultLeaderboardBoard("6-FRAME CHALLENGE"),
    tenFrame: defaultLeaderboardBoard("10-FRAME CHALLENGE"),
  };
}

export type RankedEntry = LeaderboardEntry & { rank: number };

export function rankEntries(entries: LeaderboardEntry[]): RankedEntry[] {
  return entries
    .filter((e) => e.player.trim() !== "")
    .sort((a, b) => b.score - a.score)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

export function topScoreAcrossBoards(state: Leaderboard): number | null {
  const scores = [...state.sixFrame.entries, ...state.tenFrame.entries]
    .filter((e) => e.player.trim() !== "")
    .map((e) => e.score);
  return scores.length > 0 ? Math.max(...scores) : null;
}

export function useLeaderboard() {
  return useQuery({
    queryKey: LEADERBOARD_KEY,
    queryFn: () => api.get<Leaderboard>("/bowlboxx/leaderboard"),
    refetchInterval: 2500,
  });
}

export function usePublishLeaderboardBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      board,
      body,
    }: {
      board: LeaderboardBoardSlug;
      body: LeaderboardBoard;
    }) => api.patch<Leaderboard>(`/bowlboxx/leaderboard/${board}`, body),
    onSuccess: (data) => queryClient.setQueryData(LEADERBOARD_KEY, data),
  });
}
