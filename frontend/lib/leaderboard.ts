"use client";

/**
 * BowlBoxx TV leaderboard — two independently-published boards (6-frame,
 * 10-frame) backed by one singleton doc on the server (mirrors how
 * CinemaSettings works). The display polls every few seconds rather than
 * relying on localStorage/BroadcastChannel, since it may run in the TV's
 * own built-in browser instead of a laptop tab alongside the editor.
 */

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

/** Highest score first; blank rows (no player name) are dropped. */
export function rankEntries(entries: LeaderboardEntry[]): RankedEntry[] {
  return entries
    .filter((e) => e.player.trim() !== "")
    .sort((a, b) => b.score - a.score)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

/** Polls both boards — used by the TV display and the edit form alike. */
export function useLeaderboard() {
  return useQuery({
    queryKey: LEADERBOARD_KEY,
    queryFn: () => api.get<Leaderboard>("/bowlboxx/leaderboard"),
    refetchInterval: 2500,
  });
}

/** Publishes one board without touching the other. Seeds the query cache
 *  with the server's response immediately, so the publishing tab updates
 *  without waiting for its next poll tick. */
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
