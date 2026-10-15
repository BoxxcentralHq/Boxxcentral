"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import MovieBookingDialog from "@/components/MovieBookingDialog";
import { Button } from "@/components/ui/button";
import type { NowShowingMovie } from "@/lib/api/types";
import type { ShowSelection } from "@/lib/showtimes";
import CinemaHero from "./CinemaHero";
import FilmListing from "./FilmListing";
import TrailerDialog from "./TrailerDialog";

export default function CinemaLobby({
  movies,
  vatRate,
  fallbackVideo,
}: {
  movies: NowShowingMovie[];
  vatRate: number;
  fallbackVideo?: string;
}) {
  const [selectedMovie, setSelectedMovie] = useState<NowShowingMovie | null>(
    null,
  );
  const [selection, setSelection] = useState<ShowSelection>();
  const [bookingKey, setBookingKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trailerMovie, setTrailerMovie] = useState<NowShowingMovie | null>(
    null,
  );
  const [trailerOpen, setTrailerOpen] = useState(false);

  function openBooking(movie: NowShowingMovie, picked?: ShowSelection) {
    setSelectedMovie(movie);
    setSelection(picked);
    setBookingKey((k) => k + 1);
    setDialogOpen(true);
  }

  function openTrailer(movie: NowShowingMovie) {
    setTrailerMovie(movie);
    setTrailerOpen(true);
  }

  if (movies.length === 0) {
    return <NoScreenings fallbackVideo={fallbackVideo} />;
  }

  return (
    <>
      <CinemaHero
        movies={movies}
        fallbackVideo={fallbackVideo}
        onBook={openBooking}
        onTrailer={openTrailer}
      />
      <FilmListing
        movies={movies}
        onBook={openBooking}
        onTrailer={openTrailer}
      />

      <MovieBookingDialog
        key={bookingKey}
        movie={selectedMovie}
        initialSelection={selection}
        vatRate={vatRate}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      <TrailerDialog
        movie={trailerMovie}
        open={trailerOpen}
        onOpenChange={setTrailerOpen}
        onBook={(movie) => {
          setTrailerOpen(false);
          openBooking(movie);
        }}
      />
    </>
  );
}

function NoScreenings({ fallbackVideo }: { fallbackVideo?: string }) {
  return (
    <section className="relative flex h-svh min-h-150 items-end overflow-hidden bg-boxx-night">
      {fallbackVideo && (
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
      )}
      <div className="absolute inset-0 bg-linear-to-t from-boxx-night via-boxx-night/60 to-boxx-night/30" />

      <Container className="relative pb-14 sm:pb-20">
        <p className="text-sm font-semibold text-boxx-white/70">FilmBoxx</p>
        <h1 className="mt-3 max-w-3xl font-heading text-5xl leading-[0.95] tracking-tight text-balance text-boxx-white sm:text-6xl">
          New screenings coming soon
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-boxx-mist">
          Nothing is scheduled for the week ahead yet. Check back shortly, or
          talk to us about booking the whole room for a private screening.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/contact">Ask about private screenings</Link>
        </Button>
      </Container>
    </section>
  );
}
