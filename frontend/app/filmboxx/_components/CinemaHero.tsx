"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  PlayIcon,
  Ticket01Icon,
} from "@hugeicons/core-free-icons";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import type { NowShowingMovie } from "@/lib/api/types";
import { lowestPrice } from "@/lib/showtimes";
import { cn } from "@/lib/utils";

const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;
const ROTATE_MS = 9000;
const MAX_FEATURED = 5;

/**
 * Full-bleed featured-film hero: the movie's still fills the screen, copy
 * sits bottom-left. The first few films rotate (paused on hover and for
 * reduced-motion users), with prev/next controls bottom-right.
 */
export default function CinemaHero({
  movies,
  fallbackVideo,
  onBook,
  onTrailer,
}: {
  movies: NowShowingMovie[];
  fallbackVideo?: string;
  onBook: (movie: NowShowingMovie) => void;
  onTrailer: (movie: NowShowingMovie) => void;
}) {
  const featured = movies.slice(0, MAX_FEATURED);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const movie = featured[index];
  const rotating = featured.length > 1 && !paused && !reduceMotion;

  useEffect(() => {
    if (!rotating) return;
    const timer = setTimeout(
      () => setIndex((i) => (i + 1) % featured.length),
      ROTATE_MS,
    );
    return () => clearTimeout(timer);
  }, [rotating, index, featured.length]);

  const step = (delta: number) =>
    setIndex((i) => (i + delta + featured.length) % featured.length);

  const fromPrice = lowestPrice(movie.showtimes);
  const meta = [
    movie.rating && `Rated ${movie.rating}`,
    movie.genre,
    movie.durationMins !== undefined && `${movie.durationMins} min`,
    fromPrice !== null && `From ${naira(fromPrice)} a seat`,
  ].filter(Boolean);

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative h-svh min-h-150 overflow-hidden bg-boxx-night"
    >
      {/* Background still */}
      <AnimatePresence initial={false}>
        <motion.div
          key={movie._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt=""
              fill
              priority
              quality={100}
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            fallbackVideo && (
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src={fallbackVideo}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden
              />
            )
          )}
        </motion.div>
      </AnimatePresence>

      {/* Just enough shade for the copy to read */}
      <div className="absolute inset-0 bg-linear-to-t from-boxx-night via-boxx-night/40 to-boxx-night/20" />
      <div className="absolute inset-0 bg-linear-to-r from-boxx-night/80 via-boxx-night/20 to-transparent" />

      <Container className="relative flex h-full flex-col justify-end pb-14 sm:pb-20">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div key={movie._id} className="max-w-2xl">
            <p className="text-sm font-semibold text-boxx-white/70">
              Now showing at FilmBoxx
            </p>
            <h1
              className={cn(
                "font-heading mt-3 max-w-3xl text-5xl leading-[0.95] tracking-tight text-balance text-boxx-white sm:text-6xl lg:text-7xl",
              )}
            >
              {movie.title}
            </h1>
            <p className="mt-5 text-sm text-boxx-white/80">
              {meta.join("  |  ")}
            </p>
            {movie.synopsis && (
              <p className="mt-4 line-clamp-2 max-w-lg text-base leading-relaxed text-boxx-mist">
                {movie.synopsis}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button type="button" size="lg" onClick={() => onBook(movie)}>
                <HugeiconsIcon
                  icon={Ticket01Icon}
                  aria-hidden
                  className="size-4"
                />
                Buy Ticket
              </Button>
              {movie.trailerUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => onTrailer(movie)}
                >
                  <HugeiconsIcon
                    icon={PlayIcon}
                    aria-hidden
                    className="size-4"
                  />
                  Play Trailer
                </Button>
              )}
            </div>
          </div>

          {featured.length > 1 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-boxx-white/70 tabular-nums">
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(featured.length).padStart(2, "0")}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous film"
                  className="flex size-11 items-center justify-center rounded-full border border-boxx-white/30 text-boxx-white transition-colors hover:border-boxx-white hover:bg-boxx-white hover:text-boxx-night"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next film"
                  className="flex size-11 items-center justify-center rounded-full border border-boxx-white/30 text-boxx-white transition-colors hover:border-boxx-white hover:bg-boxx-white hover:text-boxx-night"
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
