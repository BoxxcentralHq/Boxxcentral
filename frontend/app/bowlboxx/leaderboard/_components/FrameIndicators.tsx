"use client";

import { cn } from "@/lib/utils";
import { poppins } from "./fonts";

export default function FrameIndicators({ count }: { count: number }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-[clamp(0.15rem,0.3vh,0.25rem)]">
      <span
        className={cn(
          poppins.className,
          "text-[clamp(0.9rem,1.9vw,1.4rem)] leading-none font-extrabold text-boxx-white",
        )}
      >
        {count}
      </span>
      <span className="text-[clamp(0.42rem,0.75vw,0.55rem)] font-bold tracking-[0.15em] text-boxx-white/70 uppercase">
        Frames
      </span>
      <div className="flex items-center gap-[clamp(0.12rem,0.35vw,0.25rem)]">
        {Array.from({ length: count }, (_, i) => (
          <span
            key={i}
            className="size-[clamp(0.25rem,0.5vw,0.35rem)] rounded-full bg-boxx-white/70"
          />
        ))}
      </div>
    </div>
  );
}
