// server-component fetches for PUBLIC data only — admin screens are
// client components and use lib/api/client.ts with cookie auth
import { buildUrl, parseResponse, Query } from "./core";
import type { Availability, CinemaSettings, Movie } from "./types";

type CacheOpts = {
  // seconds between revalidations; 0 = always fresh (no-store)
  revalidate?: number;
};

// fails soft: a down backend renders the page without the data, not a crash
export async function serverFetch<T>(
  path: string,
  query?: Query,
  { revalidate = 60 }: CacheOpts = {},
): Promise<T | null> {
  try {
    const res = await fetch(buildUrl(path, query), {
      ...(revalidate === 0
        ? { cache: "no-store" as const }
        : { next: { revalidate } }),
    });
    return await parseResponse<T>(res);
  } catch {
    return null;
  }
}

export function getCinemaSettings() {
  return serverFetch<CinemaSettings>("/cinema/settings", undefined, {
    revalidate: 60,
  });
}

export function getMovies() {
  return serverFetch<Movie[]>("/cinema/movies", undefined, { revalidate: 60 });
}

export function getAvailability(date: string) {
  return serverFetch<Availability>(
    "/bookings/availability",
    { date },
    { revalidate: 0 },
  );
}
