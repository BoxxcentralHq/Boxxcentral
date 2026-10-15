"use client";

import { useSyncExternalStore } from "react";
import type { Showtime } from "./api/types";

/**
 * Date/showtime helpers shared by the FilmBoxx listing and the ticket
 * dialog. All "now" maths is in venue time — Lagos is UTC+1 year-round,
 * so it's a fixed offset with no DST to worry about.
 */

export const DAYS_AHEAD = 7;
const LAGOS_OFFSET_MS = 60 * 60 * 1000;
const DAY_MS = 86_400_000;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export type ShowDay = {
  offset: number;
  weekday: string;
  date: number;
  month: string;
  /** "YYYY-MM-DD" in Lagos time */
  iso: string;
};

/** A day + time picked from the listing, handed to the ticket dialog. */
export type ShowSelection = {
  dayOffset: number;
  showtimeId: string;
};

/*
 * Current minute, client-only. The server snapshot is null so the first
 * client render matches SSR; anything time-dependent fills in after.
 */
const subscribeMinute = (onChange: () => void) => {
  const id = setInterval(onChange, 30_000);
  return () => clearInterval(id);
};
const currentMinute = () => Math.floor(Date.now() / 60_000);

export function useNowMinute() {
  return useSyncExternalStore(subscribeMinute, currentMinute, () => null);
}

export function getShowDays(nowMinute: number): ShowDay[] {
  const lagosNow = nowMinute * 60_000 + LAGOS_OFFSET_MS;
  return Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const d = new Date(lagosNow + i * DAY_MS);
    return {
      offset: i,
      weekday: i === 0 ? "Today" : WEEKDAYS[d.getUTCDay()],
      date: d.getUTCDate(),
      month: MONTHS[d.getUTCMonth()],
      iso: d.toISOString().slice(0, 10),
    };
  });
}

/** Minutes past midnight in Lagos for `dayOffset` 0, else null (nothing past). */
export function getCutoff(nowMinute: number | null, dayOffset: number) {
  if (nowMinute === null || dayOffset !== 0) return null;
  return Math.floor(((nowMinute * 60_000 + LAGOS_OFFSET_MS) % DAY_MS) / 60_000);
}

export function minutesOf(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function isPastShowtime(s: Showtime, cutoff: number | null) {
  return cutoff !== null && minutesOf(s.time) <= cutoff;
}

export function sortShowtimes(showtimes: Showtime[] = []) {
  return [...showtimes].sort((a, b) => minutesOf(a.time) - minutesOf(b.time));
}

export function showtimesOn(showtimes: Showtime[], iso: string | undefined) {
  return sortShowtimes(showtimes.filter((s) => s.date === iso));
}

export function lowestPrice(showtimes: Showtime[]) {
  return showtimes.length > 0
    ? Math.min(...showtimes.map((s) => s.ticketPrice))
    : null;
}

/** "13:30" → "1:30 PM" */
export function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function formatDuration(mins: number) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}
