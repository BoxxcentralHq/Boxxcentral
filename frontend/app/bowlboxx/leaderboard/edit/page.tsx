"use client";

import { useState } from "react";
import Link from "next/link";
import { toast, toastApiError } from "@/lib/api/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  LeaderboardBoard,
  LeaderboardBoardSlug,
  LeaderboardEntry,
} from "@/lib/api/types";
import {
  defaultLeaderboardBoard,
  usePublishLeaderboardBoard,
  useLeaderboard,
  LEADERBOARD_SLOTS,
} from "@/lib/leaderboard";

type FormEntry = { id: string; player: string; score: number | null };

function padToSlots(entries: LeaderboardEntry[]): FormEntry[] {
  return Array.from({ length: LEADERBOARD_SLOTS }, (_, i) => ({
    id: `slot-${i}`,
    player: entries[i]?.player ?? "",
    score: entries[i]?.score ?? null,
  }));
}


function stripBlanks(rows: FormEntry[]): LeaderboardEntry[] {
  return rows
    .filter((r) => r.player.trim() !== "" && r.score !== null)
    .map((r) => ({ player: r.player.trim(), score: r.score as number }));
}

/** One board's editor — publishes independently of the other board. */
function BoardEditor({
  heading,
  slug,
  defaultSubtitle,
  board,
}: {
  heading: string;
  slug: LeaderboardBoardSlug;
  defaultSubtitle: string;
  board: LeaderboardBoard | undefined;
}) {
  const publishMutation = usePublishLeaderboardBoard();

  const [subtitle, setSubtitle] = useState(defaultSubtitle);
  const [draft, setDraft] = useState<FormEntry[]>(() => padToSlots([]));
  const [seededFrom, setSeededFrom] = useState<LeaderboardBoard | undefined>(
    undefined,
  );

  if (board && board !== seededFrom) {
    setSeededFrom(board);
    setSubtitle(board.subtitle);
    setDraft(padToSlots(board.entries));
  }

  const setPlayer = (id: string, player: string) =>
    setDraft((rows) => rows.map((r) => (r.id === id ? { ...r, player } : r)));

  const setScore = (id: string, raw: string) =>
    setDraft((rows) =>
      rows.map((r) =>
        r.id === id ? { ...r, score: raw === "" ? null : Number(raw) } : r,
      ),
    );

  const handlePublish = () => {
    publishMutation.mutate(
      {
        board: slug,
        body: { subtitle: subtitle.trim() || defaultSubtitle, entries: stripBlanks(draft) },
      },
      {
        onSuccess: () => toast.success(`${heading} published to the TV screen`),
        onError: (error) => toastApiError(error, `Couldn't publish ${heading}.`),
      },
    );
  };

  const handleClear = () => {
    const cleared = defaultLeaderboardBoard(defaultSubtitle);
    setSubtitle(cleared.subtitle);
    setDraft(padToSlots(cleared.entries));
    publishMutation.mutate(
      { board: slug, body: cleared },
      {
        onSuccess: () => toast.success(`${heading} cleared`),
        onError: (error) => toastApiError(error, `Couldn't clear ${heading}.`),
      },
    );
  };

  return (
    <section>
      <h2 className="text-lg font-bold text-boxx-white">{heading}</h2>

      <div className="mt-4">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-boxx-dim">
          Subtitle
        </label>
        <Input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder={defaultSubtitle}
          className="max-w-sm"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-boxx-line">
        <div className="grid grid-cols-[1fr_140px] gap-3 bg-boxx-coal px-4 py-3 text-xs font-semibold uppercase tracking-wider text-boxx-dim">
          <span>Player</span>
          <span>Score</span>
        </div>
        <div className="divide-y divide-boxx-line">
          {draft.map((entry, i) => (
            <div
              key={entry.id}
              className="grid grid-cols-[1fr_140px] items-center gap-3 px-4 py-3"
            >
              <Input
                value={entry.player}
                onChange={(e) => setPlayer(entry.id, e.target.value)}
                placeholder={`Player ${i + 1}`}
              />
              <Input
                type="number"
                value={entry.score ?? ""}
                onChange={(e) => setScore(entry.id, e.target.value)}
                placeholder="Score"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <Button onClick={handlePublish} disabled={publishMutation.isPending}>
          {publishMutation.isPending ? "Publishing…" : "Publish to Screen"}
        </Button>
        <Button
          variant="outline"
          onClick={handleClear}
          disabled={publishMutation.isPending}
        >
          Clear
        </Button>
      </div>
    </section>
  );
}

function BoardEditorSkeleton({ heading }: { heading: string }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-boxx-white">{heading}</h2>

      <div className="mt-4 animate-pulse">
        <div className="mb-2 h-3 w-16 rounded bg-boxx-slate" />
        <div className="h-11 max-w-sm rounded-xl bg-boxx-coal" />
      </div>

      <div className="mt-4 animate-pulse overflow-hidden rounded-xl border border-boxx-line">
        <div className="grid grid-cols-[1fr_140px] gap-3 bg-boxx-coal px-4 py-3">
          <div className="h-3 w-12 rounded bg-boxx-slate" />
          <div className="h-3 w-12 rounded bg-boxx-slate" />
        </div>
        <div className="divide-y divide-boxx-line">
          {Array.from({ length: LEADERBOARD_SLOTS }, (_, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_140px] items-center gap-3 px-4 py-3"
            >
              <div className="h-11 rounded-xl bg-boxx-coal" />
              <div className="h-11 rounded-xl bg-boxx-coal" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex animate-pulse gap-3">
        <div className="h-11 w-40 rounded-lg bg-boxx-coal" />
        <div className="h-11 w-24 rounded-lg bg-boxx-coal" />
      </div>
    </section>
  );
}

export default function LeaderboardEditPage() {
  const { data, isLoading } = useLeaderboard();

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-boxx-white">
            BowlBoxx Leaderboard — Staff Console
          </h1>
          <p className="mt-1 text-sm text-boxx-mist">
            Enter scores for either board, then publish it — updating one
            never touches the other. The TV display picks it up within a
            few seconds, wherever it&apos;s running.
          </p>
        </div>
        <Link
          href="/bowlboxx/leaderboard"
          target="_blank"
          className="shrink-0 text-xs font-semibold uppercase tracking-wider text-boxx-red-glow hover:underline"
        >
          Open TV display →
        </Link>
      </div>

      <div className="mt-8 space-y-10">
        {isLoading ? (
          <>
            <BoardEditorSkeleton heading="6-Frame Challenge" />
            <BoardEditorSkeleton heading="10-Frame Challenge" />
          </>
        ) : (
          <>
            <BoardEditor
              heading="6-Frame Challenge"
              slug="six-frame"
              defaultSubtitle="6-FRAME CHALLENGE"
              board={data?.sixFrame}
            />
            <BoardEditor
              heading="10-Frame Challenge"
              slug="ten-frame"
              defaultSubtitle="10-FRAME CHALLENGE"
              board={data?.tenFrame}
            />
          </>
        )}
      </div>
    </div>
  );
}
