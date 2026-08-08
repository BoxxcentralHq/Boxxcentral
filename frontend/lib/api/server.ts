import { buildUrl, parseResponse, Query } from "./core";
import type { Availability, CinemaSettings, MenuItem, Movie } from "./types";

type CacheOpts = {
  revalidate?: number;
};

export async function serverFetch<T>(
  path: string,
  query?: Query,
  { revalidate = 30 }: CacheOpts = {},
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

export function getMenuItems() {
  return serverFetch<MenuItem[]>("/menu", undefined, { revalidate: 60 });
}

export function getAvailability(date: string) {
  return serverFetch<Availability>(
    "/bookings/availability",
    { date },
    { revalidate: 0 },
  );
}
