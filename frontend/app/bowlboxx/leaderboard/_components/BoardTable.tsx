"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { rankEntries, LEADERBOARD_SLOTS, type RankedEntry } from "@/lib/leaderboard";
import type { LeaderboardBoard } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { poppins } from "./fonts";
import FrameIndicators from "./FrameIndicators";

export const BOARD_COLUMNS =
  "grid-cols-[clamp(1.75rem,4vw,3.25rem)_1fr_clamp(2.5rem,6vw,5rem)]";

const RANK_BADGES = ["/assets/rank-1.png", "/assets/rank-2.png", "/assets/rank-3.png"];

function useScorePulse(rows: (RankedEntry | null)[]) {
  const [prevScores, setPrevScores] = useState<Record<string, number>>({});
  const [pulsing, setPulsing] = useState<Set<string>>(new Set());

  const nextScores: Record<string, number> = {};
  const changed: string[] = [];
  for (const row of rows) {
    if (!row) continue;
    nextScores[row.player] = row.score;
    const prev = prevScores[row.player];
    if (prev !== undefined && prev !== row.score) changed.push(row.player);
  }

  const nextKey = Object.entries(nextScores).sort().toString();
  const prevKey = Object.entries(prevScores).sort().toString();
  if (nextKey !== prevKey) {
    setPrevScores(nextScores);
    if (changed.length > 0) {
      setPulsing((s) => new Set([...s, ...changed]));
    }
  }

  useEffect(() => {
    if (pulsing.size === 0) return;
    const timer = setTimeout(() => setPulsing(new Set()), 700);
    return () => clearTimeout(timer);
  }, [pulsing]);

  return pulsing;
}

export default function BoardTable({
  title,
  imageSrc,
  frameCount,
  board,
}: {
  title: string;
  imageSrc: string;
  frameCount: number;
  board: LeaderboardBoard;
}) {
  const reduceMotion = useReducedMotion();
  const ranked = rankEntries(board.entries);
  const rows: (RankedEntry | null)[] = Array.from(
    { length: LEADERBOARD_SLOTS },
    (_, i) => ranked[i] ?? null,
  );
  const pulsing = useScorePulse(rows);

  return (
    <div className="glow-ring h-full min-h-0">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-boxx-red/25 bg-black/94 shadow-[0_20px_45px_rgb(0_0_0/0.45)]">
        <div className="flex shrink-0 items-center justify-between gap-[clamp(0.5rem,1.2vw,0.85rem)] bg-boxx-red px-[clamp(0.85rem,1.9vw,1.75rem)] py-[clamp(0.45rem,1.2vh,0.85rem)]">
          <div className="flex min-w-0 items-center gap-[clamp(0.5rem,1.2vw,0.85rem)]">
            <Image
              src={imageSrc}
              alt=""
              width={64}
              height={64}
              className="size-[clamp(1.4rem,3vw,2.3rem)] shrink-0 object-contain"
            />
            <div className="min-w-0">
              <p
                className={cn(
                  poppins.className,
                  "truncate text-[clamp(0.85rem,1.9vw,1.5rem)] font-extrabold tracking-wide text-boxx-white",
                )}
              >
                {title}
              </p>
              <p className="truncate text-[clamp(0.5rem,0.9vw,0.7rem)] font-semibold tracking-[0.15em] text-boxx-white/70 uppercase">
                Current Leaders
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-[clamp(0.6rem,1.3vw,1rem)]">
            <span
              aria-hidden
              className="h-[clamp(1.6rem,3.4vh,2.4rem)] w-[1.5px] -skew-x-12 bg-boxx-white/40"
            />
            <FrameIndicators count={frameCount} />
          </div>
        </div>

        <div
          className={cn(
            "grid shrink-0 gap-[clamp(0.5rem,1.5vw,1.5rem)] border-b border-boxx-line/60 bg-black/70 px-[clamp(0.85rem,1.9vw,1.75rem)] py-[clamp(0.35rem,0.9vh,0.65rem)] text-[clamp(0.6rem,1vw,0.8rem)] font-bold tracking-[0.15em] text-boxx-dim",
            BOARD_COLUMNS,
          )}
        >
          <span>RANK</span>
          <span>PLAYER</span>
          <span className="text-right">SCORE</span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-[clamp(0.3rem,0.7vh,0.5rem)] px-[clamp(0.6rem,1.4vw,1.2rem)] py-[clamp(0.4rem,1vh,0.65rem)]">
          {rows.map((entry, i) => {
            const isLeader = i === 0 && entry !== null;
            const badge = entry ? RANK_BADGES[i] : undefined;
            const isPulsing = entry ? pulsing.has(entry.player) : false;
            return (
              <motion.div
                layout={reduceMotion ? false : "position"}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                key={entry?.player ?? `empty-${i}`}
                className={cn(
                  "grid min-h-0 flex-1 items-center gap-[clamp(0.5rem,1.5vw,1.5rem)] rounded-lg border px-[clamp(0.7rem,1.5vw,1.3rem)]",
                  BOARD_COLUMNS,
                  !entry && "opacity-40",
                  isLeader
                    ? "border-boxx-red/60 bg-gradient-to-r from-boxx-red/25 via-boxx-red/10 to-transparent shadow-[0_0_16px_rgba(255,3,6,0.35)]"
                    : "border-boxx-line/40 bg-white/[0.03]",
                )}
              >
                {badge ? (
                  <Image
                    src={badge}
                    alt=""
                    width={80}
                    height={90}
                    className={cn(
                      "object-contain",
                      isLeader
                        ? "h-[clamp(2rem,4.6vw,3.4rem)] w-auto"
                        : "h-[clamp(1.5rem,3.3vw,2.4rem)] w-auto",
                    )}
                  />
                ) : (
                  <span className="font-heading text-[clamp(0.95rem,2.1vw,1.65rem)] text-boxx-white">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}
                <div className="flex min-w-0 items-center gap-[clamp(0.4rem,1vw,0.75rem)]">
                  <span
                    className={cn(
                      "truncate text-[clamp(1.05rem,2.4vw,1.85rem)] font-bold",
                      entry ? "text-boxx-white" : "text-boxx-dim font-normal italic",
                      isPulsing && "animate-score-pulse",
                    )}
                  >
                    {entry?.player ?? "OPEN POSITION"}
                  </span>
                  {isLeader && (
                    <span className="shrink-0 rounded border border-boxx-red/50 bg-boxx-red/20 px-[0.5em] py-[0.15em] text-[clamp(0.55rem,1vw,0.75rem)] font-bold tracking-wider text-boxx-red-glow uppercase">
                      Leader
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-right font-heading text-[clamp(1.05rem,2.4vw,1.85rem)]",
                    isLeader ? "text-boxx-red" : "text-boxx-white",
                    isPulsing && "animate-score-pulse",
                  )}
                >
                  {entry ? entry.score : "—"}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
