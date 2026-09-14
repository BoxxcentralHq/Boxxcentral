"use client";

import { LEADERBOARD_SLOTS } from "@/lib/leaderboard";

export default function BoardEditorSkeleton({ heading }: { heading: string }) {
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
