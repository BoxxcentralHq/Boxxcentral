"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Poppins } from "next/font/google";
import {
  defaultLeaderboardState,
  rankEntries,
  useLeaderboard,
  LEADERBOARD_SLOTS,
} from "@/lib/leaderboard";
import { cn } from "@/lib/utils";

const poppins = Poppins({
  weight: ["800", "900"],
  subsets: ["latin"],
  display: "swap",
});

function useFullscreenHotkey() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isDesktopHotkey = e.key.toLowerCase() === "f";
      const isRemoteOk = e.key === "Enter" || e.keyCode === 13;
      if (!isDesktopHotkey && !isRemoteOk) return;

      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}

export default function LeaderboardDisplayPage() {
  useFullscreenHotkey();
  const { data } = useLeaderboard();
  const state = data ?? defaultLeaderboardState();
  const ranked = rankEntries(state.entries);
  const rows = Array.from(
    { length: LEADERBOARD_SLOTS },
    (_, i) => ranked[i] ?? null,
  );
  const leader = ranked[0];

  return (
    <div className="flex min-h-screen flex-col bg-boxx-night px-10 py-8 text-boxx-white sm:px-16 sm:py-10">
      <header className="text-center">
        <h1
          className={cn(
            poppins.className,
            "text-4xl font-extrabold tracking-tight sm:text-6xl",
          )}
        >
          BOWLBOXX <span className="text-boxx-red">LEADERBOARD</span>
        </h1>
        <p className="mt-2 text-sm font-semibold tracking-[0.3em] text-boxx-mist sm:text-base">
          {state.subtitle}
        </p>
      </header>

      <div className="mt-10 grid flex-1 grid-cols-1 gap-8 lg:grid-cols-[1fr_1.6fr]">
        <div className="flex flex-col items-center justify-between rounded-2xl border border-boxx-line bg-boxx-coal p-8 text-center">
          <p className="text-xs font-semibold tracking-[0.25em] text-boxx-dim sm:text-sm">
            CURRENT SCORE TO BEAT
          </p>
          <p className="font-heading text-8xl text-boxx-red sm:text-[9rem]">
            {leader ? leader.score : "—"}
          </p>
          <p className="text-base text-boxx-mist sm:text-lg">
            {leader ? `by ${leader.player}` : "No scores yet"}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-boxx-line">
          <div className="grid grid-cols-[80px_1fr_120px] bg-boxx-red px-6 py-5 text-xs font-bold tracking-[0.2em] text-boxx-white sm:text-sm">
            <span>RANK</span>
            <span>PLAYER</span>
            <span className="text-right">SCORE</span>
          </div>
          <div className="divide-y divide-boxx-line bg-boxx-coal">
            {rows.map((entry, i) => (
              <div
                key={i}
                className={cn(
                  "grid grid-cols-[80px_1fr_120px] items-center px-6 py-3 sm:py-4",
                  !entry && "opacity-30",
                )}
              >
                <span className="font-heading text-lg text-boxx-white sm:text-xl">
                  {i + 1}
                </span>
                <span className="truncate text-base text-boxx-white sm:text-lg">
                  {entry?.player ?? "—"}
                </span>
                <span className="text-right font-heading text-lg text-boxx-white sm:text-xl">
                  {entry ? entry.score : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-5 flex items-center justify-between">
        <Image src="/bowlboxx.png" alt="BowlBoxx" width={176} height={30} />
        <Image src="/logo.png" alt="BoxxCentral" width={135} height={50} />
      </footer>
    </div>
  );
}
