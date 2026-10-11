"use client";

/**
 * Ticket bookings for public cinema screenings — the movies admin posts
 * when no room is privately booked (see app/filmboxx/_components / MovieBookingDialog).
 * There's no backend endpoint for this yet (the /cinema/movies API has no
 * price or schedule on a Movie), so this mocks the same request/response
 * shape as the private FilmBoxx flow (lib/bookings.ts's useCreateBooking)
 * so a real endpoint can drop in later without touching the components.
 */

import { useMutation } from "@tanstack/react-query";
import { publicScreeningPricePerPerson } from "@/lib/pricing";

export type BookScreeningInput = {
  movieId: string;
  movieTitle: string;
  /** "YYYY-MM-DD", "HH:mm" and hall — set when the film has showtimes */
  showDate?: string;
  showtime?: string;
  screen?: string;
  tickets: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
};

export type BookScreeningResponse = {
  bookingRef: string;
  totalPrice: number;
};

function mockBookScreening(input: BookScreeningInput): Promise<BookScreeningResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        bookingRef: `PUB-${Date.now().toString(36).toUpperCase()}`,
        totalPrice: input.tickets * publicScreeningPricePerPerson,
      });
    }, 800);
  });
}

export function useBookPublicScreening() {
  return useMutation({
    mutationFn: mockBookScreening,
  });
}
