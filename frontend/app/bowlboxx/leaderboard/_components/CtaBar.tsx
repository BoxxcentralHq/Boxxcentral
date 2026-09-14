"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { poppins } from "./fonts";

export default function CtaBar({ topScore }: { topScore: number | null }) {
  return (
    <div className="glow-ring chamfer-banner shrink-0">
      <div className="chamfer-banner flex items-center justify-between gap-[clamp(0.75rem,2vw,1.5rem)] border border-boxx-red/25 bg-black/94 px-[clamp(1.25rem,2.8vw,2.75rem)] py-[clamp(0.5rem,1.5vh,1rem)]">
        <div className="flex min-w-0 items-center gap-[clamp(0.6rem,1.6vw,1.1rem)]">
          <Image
            src="/assets/crown.png"
            alt=""
            width={96}
            height={64}
            className="h-[clamp(1.4rem,3vw,2.4rem)] w-auto shrink-0 object-contain"
          />
          <div className="min-w-0">
            <p
              className={cn(
                poppins.className,
                "truncate text-[clamp(0.95rem,2.1vw,1.5rem)] font-extrabold tracking-wide text-boxx-white uppercase",
              )}
            >
              Can you take the <span className="text-boxx-red">top spot?</span>
            </p>
            <p className="truncate text-[clamp(0.65rem,1.3vw,0.9rem)] font-semibold tracking-wide text-boxx-mist uppercase">
              {topScore !== null
                ? `Beat ${topScore} points to enter the leaderboard.`
                : "Be the first to set the score to beat."}
            </p>
          </div>
        </div>

        <span
          aria-hidden
          className="hidden h-[clamp(1.5rem,3vh,2.25rem)] w-[2px] shrink-0 -skew-x-12 bg-boxx-red/50 sm:block"
        />

        <div className="chamfer-banner flex shrink-0 items-center gap-[clamp(0.35rem,0.8vw,0.6rem)] bg-boxx-red px-[clamp(0.9rem,2vw,1.5rem)] py-[clamp(0.5rem,1.2vh,0.85rem)] text-[clamp(0.85rem,1.6vw,1.15rem)] font-extrabold tracking-wide text-boxx-white [--chamfer:8px]">
          PLAY NOW
          <span aria-hidden>→</span>
        </div>
      </div>
    </div>
  );
}
