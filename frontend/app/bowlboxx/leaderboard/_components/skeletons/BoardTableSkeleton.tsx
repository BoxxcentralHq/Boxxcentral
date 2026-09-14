"use client";

import { LEADERBOARD_SLOTS } from "@/lib/leaderboard";
import { cn } from "@/lib/utils";
import { BOARD_COLUMNS } from "../BoardTable";

export default function BoardTableSkeleton() {
  return (
    <div className="glow-ring h-full min-h-0">
      <div className="flex h-full min-h-0 animate-pulse flex-col overflow-hidden rounded-2xl border border-boxx-red/25 bg-black/82">
        <div className="shrink-0 bg-boxx-coal px-[clamp(1rem,2.2vw,2rem)] py-[clamp(0.5rem,1.4vh,1rem)]">
          <div className="h-[clamp(1.1rem,2.6vw,2rem)] w-2/3 rounded bg-boxx-slate" />
        </div>

        <div
          className={cn(
            "grid shrink-0 gap-[clamp(0.5rem,1.5vw,1.5rem)] border-b border-boxx-line/60 bg-black/40 px-[clamp(1rem,2.2vw,2rem)] py-[clamp(0.4rem,1vh,0.75rem)]",
            BOARD_COLUMNS,
          )}
        >
          <div className="h-[0.85em] w-6 rounded bg-boxx-slate" />
          <div className="h-[0.85em] w-16 rounded bg-boxx-slate" />
          <div className="h-[0.85em] w-10 justify-self-end rounded bg-boxx-slate" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col divide-y divide-boxx-line/40">
          {Array.from({ length: LEADERBOARD_SLOTS }, (_, i) => (
            <div
              key={i}
              className={cn(
                "grid min-h-0 flex-1 items-center gap-[clamp(0.5rem,1.5vw,1.5rem)] px-[clamp(1rem,2.2vw,2rem)]",
                BOARD_COLUMNS,
              )}
            >
              <div className="h-[clamp(1rem,2.2vw,1.75rem)] w-6 rounded bg-boxx-slate" />
              <div className="h-[clamp(1rem,2.2vw,1.6rem)] w-1/2 rounded bg-boxx-slate" />
              <div className="h-[clamp(1rem,2.2vw,1.75rem)] w-10 justify-self-end rounded bg-boxx-slate" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
