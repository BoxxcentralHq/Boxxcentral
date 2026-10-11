"use client";

import { useState } from "react";
import MovieBookingDialog from "@/components/MovieBookingDialog";
import type { Movie } from "@/lib/api/types";
import type { ShowSelection } from "@/lib/showtimes";
import CinemaHero from "./CinemaHero";
import FilmListing from "./FilmListing";
import TrailerDialog from "./TrailerDialog";

/**
 * Everything above the room story on /filmboxx: featured-film hero and
 * the film listing. Owns the ticket and trailer
 * dialogs so the hero and the listing share the same booking flow.
 */
export default function CinemaLobby({
  movies,
  fallbackVideo,
}: {
  movies: Movie[];
  fallbackVideo?: string;
}) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selection, setSelection] = useState<ShowSelection>();
  /* Bumped per opening so the checkout remounts with fresh state */
  const [bookingKey, setBookingKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);

  function openBooking(movie: Movie, picked?: ShowSelection) {
    setSelectedMovie(movie);
    setSelection(picked);
    setBookingKey((k) => k + 1);
    setDialogOpen(true);
  }

  function openTrailer(movie: Movie) {
    setTrailerMovie(movie);
    setTrailerOpen(true);
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
