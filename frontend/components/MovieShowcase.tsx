"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon, Ticket01Icon } from "@hugeicons/core-free-icons";
import Container from "@/components/Container";
import MovieBookingDialog from "@/components/MovieBookingDialog";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import SiteImage from "@/components/SiteImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Movie } from "@/lib/api/types";
import { publicScreeningPricePerPerson } from "@/lib/pricing";

const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

/**
 * FilmBoxx's "now showing" grid — fed by GET /cinema/movies (visible only).
 * A down or empty catalog just omits the section; guests can still bring
 * their own film, so there's nothing broken about having none listed.
 *
 * Every listed movie doubles as a public screening admin posts whenever a
 * room isn't privately booked — clicking the poster or "Book" opens a
 * per-seat ticket dialog, separate from the whole-room private booking
 * form (#book) below.
 */
export default function MovieShowcase({ movies }: { movies: Movie[] | null }) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!movies || movies.length === 0) return null;

  function openBooking(movie: Movie) {
    setSelectedMovie(movie);
    setDialogOpen(true);
  }

  return (
    <section className="border-t border-boxx-line py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Now showing"
            title="Pick your film"
            lede="Bring your own drive for a private session, or grab a seat at one of these public screenings."
          />
        </Reveal>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {movies.map((movie, i) => (
            <Reveal key={movie._id} delay={i * 80}>
              <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-boxx-line bg-boxx-coal transition-all duration-300 hover:-translate-y-1 hover:border-boxx-red/20 ">
                <button
                  type="button"
                  onClick={() => openBooking(movie)}
                  className="relative block aspect-2/3 w-full shrink-0 overflow-hidden"
                >
                  <SiteImage
                    src={movie.posterUrl}
                    alt={movie.title}
                    aspect="aspect-2/3"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="rounded-none border-0 transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
                    <Badge variant="default" className="shadow-glow">
                      Now showing
                    </Badge>
                    {movie.durationMins !== undefined && (
                      <span className="flex items-center gap-1 rounded-full bg-boxx-night/80 px-2.5 py-1 text-[11px] font-bold text-boxx-white backdrop-blur-sm">
                        <HugeiconsIcon
                          icon={Clock01Icon}
                          aria-hidden
                          className="size-3"
                        />
                        {movie.durationMins}m
                      </span>
                    )}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-boxx-night via-boxx-night/85 to-transparent px-4 pt-16 pb-4 text-left">
                    {movie.genre && (
                      <Badge variant="soft" className="mb-2">
                        {movie.genre}
                      </Badge>
                    )}
                    <h3 className="font-heading text-xl leading-tight tracking-wide text-boxx-white uppercase">
                      {movie.title}
                    </h3>
                  </div>
                </button>

                <div className="flex flex-1 flex-col p-5">
                  {movie.synopsis && (
                    <p className="line-clamp-3 text-sm leading-relaxed">
                      {movie.synopsis}
                    </p>
                  )}

                  <div className="mt-auto pt-5">
                    <div className="flex items-center justify-between gap-3 border-t border-dashed border-boxx-line pt-4">
                      <div>
                        <p className="text-[10px] font-bold tracking-[0.2em] text-boxx-dim uppercase">
                          Per person
                        </p>
                        <p className="font-heading text-lg text-boxx-red-glow">
                          {naira(publicScreeningPricePerPerson)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => openBooking(movie)}
                      >
                        <HugeiconsIcon
                          icon={Ticket01Icon}
                          aria-hidden
                          className="size-4"
                        />
                        Book
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      <MovieBookingDialog
        movie={selectedMovie}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </section>
  );
}
