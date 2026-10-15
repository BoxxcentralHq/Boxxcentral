"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  PlayIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import type { NowShowingMovie, Showtime } from "@/lib/api/types";
import {
  DAYS_AHEAD,
  formatDuration,
  formatTime,
  getCutoff,
  getShowDays,
  isPastShowtime,
  lowestPrice,
  showtimesOn,
  useNowMinute,
  type ShowSelection,
} from "@/lib/showtimes";
import { cn } from "@/lib/utils";

const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;
const ALL = "All";
/* Past this many films the list collapses and a search box appears */
const INITIAL_VISIBLE = 6;

/**
 * Box-office listing: a week of days to pick from, genre tabs, and a card
 * per film with its poster, rating, details and that day's showtimes.
 * Showtimes already past (today only) are struck through. Picking a time
 * or "Buy Ticket" opens the per-seat booking dialog.
 *
 * Large catalogs: only the first INITIAL_VISIBLE films render until
 * "Show all" is pressed, a title search appears, and on Today films with
 * no showings left sink to the bottom so bookable ones lead.
 */
export default function FilmListing({
  movies,
  onBook,
  onTrailer,
}: {
  movies: NowShowingMovie[];
  onBook: (movie: NowShowingMovie, selection?: ShowSelection) => void;
  onTrailer: (movie: NowShowingMovie) => void;
}) {
  const nowMinute = useNowMinute();
  const [dayOffset, setDayOffset] = useState(0);
  const [genre, setGenre] = useState(ALL);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const days = useMemo(
    () => (nowMinute === null ? null : getShowDays(nowMinute)),
    [nowMinute],
  );
  const cutoff = getCutoff(nowMinute, dayOffset);
  const dayIso = days?.[dayOffset]?.iso;
  const fromPrice = lowestPrice(movies.flatMap((m) => m.showtimes));

  const genres = useMemo(
    () => [
      ALL,
      ...Array.from(
        new Set(movies.map((m) => m.genre).filter((g): g is string => !!g)),
      ),
    ],
    [movies],
  );
  const searchable = movies.length > INITIAL_VISIBLE;
  const needle = query.trim().toLowerCase();
  const matches = movies.filter(
    (m) =>
      (genre === ALL || m.genre === genre) &&
      (!needle ||
        m.title.toLowerCase().includes(needle) ||
        m.genre?.toLowerCase().includes(needle)),
  );
  /* Stable sort: bookable today first, original order otherwise */
  const hasShowingsLeft = (m: NowShowingMovie) =>
    showtimesOn(m.showtimes, dayIso).some((s) => isBookable(s, cutoff));
  const ordered = [...matches].sort(
    (a, b) => Number(hasShowingsLeft(b)) - Number(hasShowingsLeft(a)),
  );
  /* A search shows every hit — collapsing results would hide them */
  const collapsed = !expanded && !needle && ordered.length > INITIAL_VISIBLE;
  const shown = collapsed ? ordered.slice(0, INITIAL_VISIBLE) : ordered;

  function changeGenre(g: string) {
    setGenre(g);
    setExpanded(false);
  }

  function collapse() {
    setExpanded(false);
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      ref={sectionRef}
      id="now-showing"
      className="scroll-mt-24 py-24 sm:py-32"
    >
      <Container>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2
            className={cn(
              "font-heading text-4xl tracking-tight text-boxx-white sm:text-5xl",
            )}
          >
            Now showing
          </h2>
          <p className="text-sm text-boxx-dim">
            {movies.length} {movies.length === 1 ? "film" : "films"}
            {fromPrice !== null && ` · Tickets from ${naira(fromPrice)} a seat`}
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

        {/* Genre tabs + search */}
        <div className="mt-8 flex flex-col-reverse gap-4 border-b border-boxx-line md:flex-row md:items-end md:justify-between">
          {genres.length > 2 ? (
            <div
              role="tablist"
              aria-label="Filter by genre"
              className="-mx-5 flex min-w-0 gap-6 overflow-x-auto px-5 sm:mx-0 sm:px-0"
            >
              {genres.map((g) => (
                <button
                  key={g}
                  type="button"
                  role="tab"
                  aria-selected={genre === g}
                  onClick={() => changeGenre(g)}
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
          ) : (
            <span />
          )}

          {searchable && (
            <label className="relative mb-3 block shrink-0 md:w-64">
              <span className="sr-only">Search films</span>
              <HugeiconsIcon
                icon={Search01Icon}
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-boxx-dim"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search films"
                className="h-10 w-full rounded-lg border border-boxx-line bg-boxx-coal pr-9 pl-9 text-sm text-boxx-white outline-none placeholder:text-boxx-dim focus:border-boxx-white/40 [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-boxx-dim hover:text-boxx-white"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                </button>
              )}
            </label>
          )}
        </div>

        {needle && (
          <p className="mt-6 text-sm text-boxx-dim" aria-live="polite">
            {ordered.length} {ordered.length === 1 ? "result" : "results"} for “
            {query.trim()}”
          </p>
        )}

        {ordered.length === 0 && (
          <div className="mt-10 rounded-xl border border-dashed border-boxx-line py-16 text-center">
            <p className="text-boxx-white">No films match that.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                changeGenre(ALL);
              }}
              className="mt-3 text-sm text-boxx-red-glow underline-offset-4 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {shown.map((movie, i) => (
            <Reveal key={movie._id} variant="fade" delay={(i % 2) * 80}>
              <FilmCard
                movie={movie}
                dayOffset={dayOffset}
                dayIso={dayIso}
                cutoff={cutoff}
                onBook={onBook}
                onTrailer={onTrailer}
              />
            </Reveal>
          ))}
        </div>

        {(collapsed ||
          (expanded && ordered.length > INITIAL_VISIBLE && !needle)) && (
          <div className="mt-10 flex flex-col items-center gap-3">
            {collapsed && (
              <p className="text-sm text-boxx-dim">
                Showing {shown.length} of {ordered.length} films
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={collapsed ? () => setExpanded(true) : collapse}
            >
              {collapsed ? `Show all ${ordered.length} films` : "Show fewer"}
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}

function isBookable(s: Showtime, cutoff: number | null) {
  return !isPastShowtime(s, cutoff) && s.seatsLeft > 0;
}

function FilmCard({
  movie,
  dayOffset,
  dayIso,
  cutoff,
  onBook,
  onTrailer,
}: {
  movie: NowShowingMovie;
  dayOffset: number;
  dayIso: string | undefined;
  cutoff: number | null;
  onBook: (movie: NowShowingMovie, selection?: ShowSelection) => void;
  onTrailer: (movie: NowShowingMovie) => void;
}) {
  const showtimes = showtimesOn(movie.showtimes, dayIso);
  const allPast =
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

        <h3
          className={cn(
            "font-heading mt-2 text-xl leading-tight tracking-tight text-boxx-white sm:text-2xl",
          )}
        >
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
                {allPast ? "No more showings today" : "Showtimes"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {showtimes.map((s) => {
                  const past = isPastShowtime(s, cutoff);
                  const soldOut = s.seatsLeft === 0;
                  return (
                    <button
                      key={s._id}
                      type="button"
                      disabled={past || soldOut}
                      onClick={() =>
                        onBook(movie, { dayOffset, showtimeId: s._id })
                      }
                      className={cn(
                        "flex flex-col items-start rounded-md border px-2.5 py-1.5 text-left transition-colors",
                        past || soldOut
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
                        {soldOut && !past ? "Sold out" : s.screen}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            dayIso && (
              <p className="text-sm text-boxx-dim">
                No showings on this day — try another date.
              </p>
            )
          )}
        </div>
      </div>
    </article>
  );
}
