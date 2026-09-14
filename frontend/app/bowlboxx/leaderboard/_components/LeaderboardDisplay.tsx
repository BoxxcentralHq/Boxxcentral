"use client";

import Image from "next/image";
import {
  defaultLeaderboardState,
  topScoreAcrossBoards,
  useLeaderboard,
} from "@/lib/leaderboard";
import { cn } from "@/lib/utils";
import { poppins } from "./fonts";
import BoardTable from "./BoardTable";
import BoardTableSkeleton from "./skeletons/BoardTableSkeleton";
import CtaBar from "./CtaBar";

export default function LeaderboardDisplay() {
  const { data, isLoading } = useLeaderboard();
  const state = data ?? defaultLeaderboardState();

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden text-boxx-white">
      <Image
        src="/assets/Leaderboard-background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col pl-[clamp(1rem,3vw,4rem)] pr-[clamp(5rem,11vw,12rem)]">
        <header className="relative shrink-0 pt-[clamp(1rem,2.8vh,2.5rem)] pb-[clamp(0.5rem,1.5vh,1.25rem)] text-center">
          <div className="inline-flex items-center gap-[clamp(0.5rem,1.4vw,1rem)] rounded-2xl bg-black/55 px-[clamp(1.25rem,3vw,2.5rem)] py-[clamp(0.4rem,1.2vh,0.75rem)]">
            <Image
              src="/bowlboxx.png"
              alt="BowlBoxx"
              width={176}
              height={30}
              className="h-[clamp(1.5rem,3.8vw,3.25rem)] w-auto drop-shadow-[0_0_6px_rgba(255,255,255,0.55)]"
            />
            <span
              className={cn(
                poppins.className,
                "text-[clamp(1.5rem,4vw,3.75rem)] leading-none font-extrabold tracking-tight text-boxx-red drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]",
              )}
            >
              LEADERBOARD
            </span>
          </div>


        </header>

        <div className="mx-[clamp(0.5rem,3vw,4rem)] my-[clamp(0.5rem,1.8vh,1.75rem)] grid min-h-0 flex-1 grid-cols-2 gap-[clamp(1rem,2.5vw,2.5rem)]">
          {isLoading ? (
            <>
              <BoardTableSkeleton />
              <BoardTableSkeleton />
            </>
          ) : (
            <>
              <BoardTable
                title={state.sixFrame.subtitle}
                imageSrc="/assets/bowling-ball.png"
                frameCount={6}
                board={state.sixFrame}
              />
              <BoardTable
                title={state.tenFrame.subtitle}
                imageSrc="/assets/trophy.png"
                frameCount={10}
                board={state.tenFrame}
              />
            </>
          )}
        </div>

        <div className="py-[clamp(0.75rem,2vh,1.5rem)] px-24">
          <CtaBar topScore={data ? topScoreAcrossBoards(data) : null} />
        </div>
      </div>
    </div>
  );
}
