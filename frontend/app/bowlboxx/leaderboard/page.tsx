"use client";

import Image from "next/image";
import { Poppins } from "next/font/google";
import {
  defaultLeaderboardState,
  rankEntries,
  useLeaderboard,
  LEADERBOARD_SLOTS,
  type RankedEntry,
} from "@/lib/leaderboard";
import type { LeaderboardBoard } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const poppins = Poppins({
  weight: ["800", "900"],
  subsets: ["latin"],
  display: "swap",
});

// Shared, fixed-but-fluid column widths — used identically on the label row
// and every data row so the RANK/SCORE columns stay aligned down the table.
const COLUMNS = "grid-cols-[clamp(1.75rem,4vw,3.25rem)_1fr_clamp(2.5rem,6vw,5rem)]";

function BoardTable({ title, board }: { title: string; board: LeaderboardBoard }) {
  const ranked = rankEntries(board.entries);
  const rows: (RankedEntry | null)[] = Array.from(
    { length: LEADERBOARD_SLOTS },
    (_, i) => ranked[i] ?? null,
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-boxx-line">
      <div className="shrink-0 bg-boxx-red px-[clamp(1rem,2.2vw,2rem)] py-[clamp(0.5rem,1.4vh,1rem)]">
        <p
          className={cn(
            poppins.className,
            "truncate text-[clamp(1.1rem,2.6vw,2rem)] font-extrabold tracking-wide text-boxx-white",
          )}
        >
          {title}
        </p>
      </div>

      <div
        className={cn(
          "grid shrink-0 gap-[clamp(0.5rem,1.5vw,1.5rem)] border-b border-boxx-line bg-boxx-coal px-[clamp(1rem,2.2vw,2rem)] py-[clamp(0.4rem,1vh,0.75rem)] text-[clamp(0.65rem,1.1vw,0.85rem)] font-bold tracking-[0.15em] text-boxx-dim",
          COLUMNS,
        )}
      >
        <span>RANK</span>
        <span>PLAYER</span>
        <span className="text-right">SCORE</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col divide-y divide-boxx-line bg-boxx-coal">
        {rows.map((entry, i) => {
          const isLeader = i === 0 && entry !== null;
          return (
            <div
              key={i}
              className={cn(
                "grid min-h-0 flex-1 items-center gap-[clamp(0.5rem,1.5vw,1.5rem)] px-[clamp(1rem,2.2vw,2rem)]",
                COLUMNS,
                !entry && "opacity-30",
                isLeader && "bg-boxx-red/10",
              )}
            >
              <span
                className={cn(
                  "font-heading text-boxx-white",
                  isLeader
                    ? "text-[clamp(1.5rem,3.8vw,3rem)] text-boxx-red"
                    : "text-[clamp(1rem,2.2vw,1.75rem)]",
                )}
              >
                {i + 1}
              </span>
              <span
                className={cn(
                  "truncate text-boxx-white",
                  isLeader
                    ? "text-[clamp(1.25rem,3.2vw,2.5rem)] font-bold"
                    : "text-[clamp(1rem,2.2vw,1.6rem)]",
                )}
              >
                {entry?.player ?? "—"}
              </span>
              <span
                className={cn(
                  "text-right font-heading text-boxx-white",
                  isLeader
                    ? "text-[clamp(1.5rem,3.8vw,3rem)] text-boxx-red"
                    : "text-[clamp(1rem,2.2vw,1.75rem)]",
                )}
              >
                {entry ? entry.score : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LeaderboardDisplayPage() {
  const { data } = useLeaderboard();
  const state = data ?? defaultLeaderboardState();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-boxx-night text-boxx-white">
      <header className="shrink-0 pt-[clamp(1rem,2.8vh,2.5rem)] pb-[clamp(0.5rem,1.5vh,1.25rem)] text-center">
        <h1
          className={cn(
            poppins.className,
            "text-[clamp(1.75rem,5vw,4.5rem)] leading-none font-extrabold tracking-tight",
          )}
        >
          BOWLBOXX <span className="text-boxx-red">LEADERBOARD</span>
        </h1>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-[clamp(1rem,2.5vw,2.5rem)] px-[clamp(1rem,3vw,4rem)]">
        <BoardTable title={state.sixFrame.subtitle} board={state.sixFrame} />
        <BoardTable title={state.tenFrame.subtitle} board={state.tenFrame} />
      </div>

      <footer className="flex shrink-0 items-center justify-between px-[clamp(1rem,3vw,4rem)] py-[clamp(0.75rem,2vh,1.5rem)]">
        <Image
          src="/bowlboxx.png"
          alt="BowlBoxx"
          width={176}
          height={30}
          className="h-[clamp(1.1rem,3vh,2.25rem)] w-auto"
        />
        <Image
          src="/logo.png"
          alt="BoxxCentral"
          width={135}
          height={50}
          className="h-[clamp(1.4rem,3.8vh,3.25rem)] w-auto"
        />
      </footer>
    </div>
  );
}
