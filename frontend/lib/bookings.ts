"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  Availability,
  Booking,
  BookingsPage,
  BookingStatus,
  CinemaSettings,
  CreateBookingBody,
  CreateBookingResponse,
  UpdateCinemaSettingsBody,
} from "@/lib/api/types";

export const CINEMA_SETTINGS_KEY = ["cinema", "settings"] as const;

/** Pricing, VAT, time slots, and the booking on/off switch — public, drives the form. */
export function useCinemaSettings() {
  return useQuery({
    queryKey: CINEMA_SETTINGS_KEY,
    queryFn: () => api.get<CinemaSettings>("/cinema/settings"),
    staleTime: 5 * 60_000,
  });
}

/** super_admin only — edits pricing, VAT, time slots, or the booking on/off switch. */
export function useUpdateCinemaSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateCinemaSettingsBody) =>
      api.patch<CinemaSettings>("/cinema/settings", body),
    onSuccess: (data) => queryClient.setQueryData(CINEMA_SETTINGS_KEY, data),
  });
}

/** Which of that room's time slots are still free that day. Skipped until both are picked. */
export function useAvailability(date: string | undefined, room: string | undefined) {
  return useQuery({
    queryKey: ["bookings", "availability", date, room] as const,
    queryFn: () =>
      api.get<Availability>("/bookings/availability", { date: date!, room: room! }),
    enabled: Boolean(date) && Boolean(room),
  });
}

/** Creates the booking and returns the Flutterwave link to redirect the guest to. */
export function useCreateBooking() {
  return useMutation({
    mutationFn: (body: CreateBookingBody) =>
      api.post<CreateBookingResponse>("/bookings", body),
  });
}

const ADMIN_BOOKINGS_KEY = ["admin", "bookings"] as const;

export type BookingsQuery = {
  page?: number;
  limit?: number;
  date?: string;
  status?: BookingStatus;
};

/** Staff-only paginated booking list. */
export function useBookingsList(query: BookingsQuery, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...ADMIN_BOOKINGS_KEY, query] as const,
    queryFn: () => api.get<BookingsPage>("/bookings", query),
    enabled: options?.enabled,
  });
}

/** Cancels a booking and frees its slot. */
export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<Booking>(`/bookings/${id}/cancel`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_BOOKINGS_KEY }),
  });
}

/** Marks a reserved booking's visit as done. */
export function useCompleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<Booking>(`/bookings/${id}/complete`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_BOOKINGS_KEY }),
  });
}
