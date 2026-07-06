import type { ReactNode } from "react";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  note?: string;
  videoSrc?: string;
  poster?: string;
  align?: "center" | "left";
  size?: "tall" | "standard";
};

export default function PageHero({
  eyebrow,
  title,
  description,
  actions,
  note,
  videoSrc,
  poster,
  align = "center",
  size = "standard",
}: PageHeroProps) {
  const centered = align === "center";

  return (
    <section className="relative overflow-hidden border-b border-boxx-line">
      {/* Atmospheric backdrop — always present as the video fallback */}
      <div className="absolute inset-0 bg-linear-to-b from-boxx-coal via-boxx-night to-boxx-night" />

      {videoSrc && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={videoSrc}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
      )}

      {/* Contrast scrim + red energy glow over the media */}
      <div className="absolute inset-0 bg-boxx-night/70" />
      <div className="absolute inset-0 bg-linear-to-t from-boxx-night via-transparent to-boxx-night/40" />
      <div className="absolute -top-1/3 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-boxx-red opacity-[0.1] blur-3xl" />

      <Container
        className={cn(
          "relative flex flex-col justify-center pb-24 pt-28",
          size === "tall" ? "min-h-svh" : "min-h-[64svh]",
          centered ? "items-center text-center" : "items-start text-left",
        )}
      >
        <Reveal
          className={cn(
            "flex flex-col",
            centered ? "items-center" : "items-start",
          )}
        >
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-boxx-red">
            {eyebrow}
          </span>
          <h1 className="mt-6 max-w-4xl font-heading text-5xl uppercase leading-[1.05] tracking-wide text-boxx-white sm:text-7xl lg:text-[5.5rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-6 max-w-xl text-base leading-relaxed text-boxx-mist sm:text-lg">
              {description}
            </p>
          )}
          {actions && (
            <div
              className={cn(
                "mt-10 flex flex-col gap-4 sm:flex-row",
                centered && "items-center justify-center",
              )}
            >
              {actions}
            </div>
          )}
          {note && <p className="mt-5 text-xs text-boxx-dim">{note}</p>}
        </Reveal>
      </Container>
    </section>
  );
}
