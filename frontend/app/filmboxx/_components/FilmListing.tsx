"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlayIcon, Ticket01Icon } from "@hugeicons/core-free-icons";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import type { Movie } from "@/lib/api/types";
import { publicScreeningPricePerPerson } from "@/lib/pricing";
import {
  DAYS_AHEAD,
  formatDuration,
  formatTime,
  getCutoff,
  getShowDays,
  isPastShowtime,
  sortShowtimes,
  useNowMinute,
  type ShowSelection,
} from "@/lib/showtimes";
import { cn } from "@/lib/utils";

const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;
const ALL = "All";

/**
 * Box-office listing: a week of days to pick from, genre tabs, and a card
 * per film with its poster, rating, details and that day's showtimes.
 * Showtimes already past (today only) are struck through. Picking a time
 * or "Buy Ticket" opens the per-seat booking dialog.
 */
export default function FilmListing({
  movies,
  onBook,
  onTrailer,
}: {
  movies: Movie[];
  onBook: (movie: Movie, selection?: ShowSelection) => void;
  onTrailer: (movie: Movie) => void;
}) {
  const nowMinute = useNowMinute();
  const [dayOffset, setDayOffset] = useState(0);
  const [genre, setGenre] = useState(ALL);

  const days = useMemo(
    () => (nowMinute === null ? null : getShowDays(nowMinute)),
    [nowMinute],
  );
  const cutoff = getCutoff(nowMinute, dayOffset);

  const genres = useMemo(
    () => [
      ALL,
      ...Array.from(
        new Set(movies.map((m) => m.genre).filter((g): g is string => !!g)),
      ),
    ],
    [movies],
  );
  const shown =
    genre === ALL ? movies : movies.filter((m) => m.genre === genre);

  return (
    <section id="now-showing" className="scroll-mt-24 py-24 sm:py-32">
      <Container>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-heading text-5xl tracking-wide text-boxx-white uppercase sm:text-6xl">
            Now showing
          </h2>
          <p className="text-sm text-boxx-dim">
            Tickets {naira(publicScreeningPricePerPerson)} a seat
          </p>
        </div>

        {/* Day picker */}
        <div className="-mx-5 mt-10 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
          {days
            ? days.map((d) => {
                const active = d.offset === dayOffset;
                return (
                  <button
                    key={d.offset}
                    type="button"
                    onClick={() => setDayOffset(d.offset)}
                    aria-pressed={active}
                    className={cn(
                      "flex w-20 shrink-0 flex-col items-center rounded-lg border py-3 transition-colors",
                      active
                        ? "border-boxx-red bg-boxx-red text-boxx-white"
                        : "border-boxx-line text-boxx-mist hover:border-boxx-white/40 hover:text-boxx-white",
                    )}
                  >
                    <span className="text-[11px] font-semibold tracking-wider uppercase">
                      {d.weekday}
                    </span>
                    <span className="mt-1 font-heading text-2xl leading-none">
                      {d.date}
                    </span>
                    <span
                      className={cn(
                        "mt-1 text-[11px]",
                        active ? "text-boxx-white/80" : "text-boxx-dim",
                      )}
                    >
                      {d.month}
                    </span>
                  </button>
                );
              })
            : Array.from({ length: DAYS_AHEAD }, (_, i) => (
                <span
                  key={i}
                  className="h-[82px] w-20 shrink-0 animate-pulse rounded-lg bg-boxx-coal"
                />
              ))}
        </div>

        {/* Genre tabs */}
        {genres.length > 2 && (
          <div
            role="tablist"
            aria-label="Filter by genre"
            className="-mx-5 mt-8 flex gap-6 overflow-x-auto border-b border-boxx-line px-5 sm:mx-0 sm:px-0"
          >
            {genres.map((g) => (
              <button
                key={g}
                type="button"
                role="tab"
                aria-selected={genre === g}
                onClick={() => setGenre(g)}
                className={cn(
                  "-mb-px shrink-0 border-b-2 pb-3 text-sm font-semibold whitespace-nowrap transition-colors",
                  genre === g
                    ? "border-boxx-red text-boxx-white"
                    : "border-transparent text-boxx-dim hover:text-boxx-white",
                )}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {shown.map((movie, i) => (
            <Reveal key={movie._id} variant="fade" delay={(i % 2) * 80}>
              <FilmCard
                movie={movie}
                dayOffset={dayOffset}
                cutoff={cutoff}
                onBook={onBook}
                onTrailer={onTrailer}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FilmCard({
  movie,
  dayOffset,
  cutoff,
  onBook,
  onTrailer,
}: {
  movie: Movie;
  dayOffset: number;
  cutoff: number | null;
  onBook: (movie: Movie, selection?: ShowSelection) => void;
  onTrailer: (movie: Movie) => void;
}) {
  const showtimes = sortShowtimes(movie.showtimes);
  const soldOutForDay =
    showtimes.length > 0 && showtimes.every((s) => isPastShowtime(s, cutoff));

  return (
    <article className="group flex h-full gap-4 rounded-xl border border-boxx-line bg-boxx-coal p-3 transition-colors hover:border-boxx-white/20 sm:gap-6 sm:p-4">
      {/* Poster */}
      <div className="relative aspect-2/3 w-28 shrink-0 self-start overflow-hidden rounded-lg bg-boxx-slate sm:w-40">
        {movie.posterUrl && (
          <Image
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            fill
            sizes="160px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        {movie.trailerUrl && (
          <button
            type="button"
            onClick={() => onTrailer(movie)}
            aria-label={`Play ${movie.title} trailer`}
            className="absolute inset-0 flex items-end justify-center bg-linear-to-t from-boxx-night/80 via-transparent to-transparent pb-3 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          >
            <span className="flex items-center gap-1.5 rounded-full bg-boxx-white px-3 py-1.5 text-xs font-bold text-boxx-night">
              <HugeiconsIcon icon={PlayIcon} className="size-3" />
              Trailer
            </span>
          </button>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col py-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-boxx-mist">
          {movie.rating && (
            <span className="rounded border border-boxx-white/40 px-1.5 py-0.5 font-bold text-boxx-white">
              {movie.rating}
            </span>
          )}
          {movie.genre && <span>{movie.genre}</span>}
          {movie.durationMins !== undefined && (
            <span>{formatDuration(movie.durationMins)}</span>
          )}
        </div>

        <h3 className="mt-2 font-heading text-2xl leading-tight tracking-wide text-boxx-white uppercase sm:text-3xl">
          {movie.title}
        </h3>

        {movie.synopsis && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-boxx-dim sm:line-clamp-3">
            {movie.synopsis}
          </p>
        )}

        <div className="mt-auto pt-4">
          {showtimes.length > 0 ? (
            <>
              <p className="text-[11px] font-semibold tracking-wider text-boxx-dim uppercase">
                {soldOutForDay ? "No more showings today" : "Showtimes"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {showtimes.map((s) => {
                  const past = isPastShowtime(s, cutoff);
                  return (
                    <button
                      key={`${s.time}-${s.screen}`}
                      type="button"
                      disabled={past}
                      onClick={() => onBook(movie, { dayOffset, time: s.time })}
                      className={cn(
                        "flex flex-col items-start rounded-md border px-2.5 py-1.5 text-left transition-colors",
                        past
                          ? "cursor-not-allowed border-boxx-line/60 opacity-40"
                          : "border-boxx-line hover:border-boxx-red hover:bg-boxx-red/10",
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm font-bold text-boxx-white tabular-nums",
                          past && "line-through",
                        )}
                      >
                        {formatTime(s.time)}
                      </span>
                      <span className="text-[10px] text-boxx-dim">
                        {s.screen}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <Button type="button" size="sm" onClick={() => onBook(movie)}>
              <HugeiconsIcon
                icon={Ticket01Icon}
                aria-hidden
                className="size-4"
              />
              Buy Ticket
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
