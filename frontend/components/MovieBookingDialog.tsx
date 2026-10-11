"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  MinusSignIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toastApiError } from "@/lib/api/toast";
import type { Movie } from "@/lib/api/types";
import { publicScreeningPricePerPerson } from "@/lib/pricing";
import { useBookPublicScreening } from "@/lib/publicScreenings";
import {
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
const MAX_TICKETS = 10;

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xs font-semibold tracking-wider text-boxx-dim uppercase"
    >
      {children}
    </label>
  );
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-3 text-sm font-semibold text-boxx-white">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

type MovieBookingDialogProps = {
  /** Last-selected movie — kept truthy through the close animation so the
   *  dialog doesn't flash empty while it fades out. */
  movie: Movie | null;
  /** Day + time already picked in the listing, if any. */
  initialSelection?: ShowSelection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Ticket checkout for a public screening — distinct from the whole-room
 * private booking form (BookingSection), which stays anchored at #book.
 * Poster and running order summary on the left; date, showtime, seats and
 * contact details on the right. Films without showtimes skip straight to
 * seats. Remount it (via `key`) per opening to reset its state.
 */
export default function MovieBookingDialog({
  movie,
  initialSelection,
  open,
  onOpenChange,
}: MovieBookingDialogProps) {
  const nowMinute = useNowMinute();
  const [dayOffset, setDayOffset] = useState(initialSelection?.dayOffset ?? 0);
  const [time, setTime] = useState<string | null>(
    initialSelection?.time ?? null,
  );
  const [tickets, setTickets] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const bookScreening = useBookPublicScreening();

  const days = useMemo(
    () => (nowMinute === null ? [] : getShowDays(nowMinute)),
    [nowMinute],
  );

  if (!movie) return null;

  const showtimes = sortShowtimes(movie.showtimes);
  const hasShowtimes = showtimes.length > 0;
  const cutoff = getCutoff(nowMinute, dayOffset);
  const day = days[dayOffset];
  const showtime = showtimes.find(
    (s) => s.time === time && !isPastShowtime(s, cutoff),
  );

  const total = tickets * publicScreeningPricePerPerson;
  const detailsDone =
    name.trim() !== "" && email.trim() !== "" && phone.trim() !== "";
  const isValid = detailsDone && (!hasShowtimes || !!showtime);

  const meta = [
    movie.genre,
    movie.durationMins !== undefined && formatDuration(movie.durationMins),
  ].filter(Boolean);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid || !movie) return;

    bookScreening.mutate(
      {
        movieId: movie._id,
        movieTitle: movie.title,
        showDate: showtime ? day?.iso : undefined,
        showtime: showtime?.time,
        screen: showtime?.screen,
        tickets,
        guestName: name.trim(),
        guestEmail: email.trim(),
        guestPhone: phone.trim(),
      },
      {
        onError: (error) =>
          toastApiError(
            error,
            "Couldn't reserve your seats. Please try again.",
          ),
      },
    );
  }

  const whenLabel =
    showtime && day
      ? `${day.weekday === "Today" ? "Today" : `${day.weekday} ${day.date} ${day.month}`}, ${formatTime(showtime.time)}`
      : null;

  const summary = [
    whenLabel && { label: "When", value: whenLabel },
    showtime && { label: "Screen", value: showtime.screen },
    {
      label: "Seats",
      value: `${tickets} × ${naira(publicScreeningPricePerPerson)}`,
    },
  ].filter((row): row is { label: string; value: string } => !!row);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] p-0 sm:max-w-3xl">
        {bookScreening.isSuccess ? (
          /* ── Confirmation ticket ─────────────────────────────── */
          <div className="p-6 sm:p-10">
            <div className="flex items-center gap-3">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className="size-7 text-boxx-red-glow"
              />
              <DialogTitle className="font-heading text-3xl tracking-wide uppercase">
                You&apos;re booked
              </DialogTitle>
            </div>
            <DialogDescription className="mt-2">
              We&apos;ve sent your tickets to{" "}
              <span className="text-boxx-white">{email.trim()}</span>. Show the
              reference at the door.
            </DialogDescription>

            <div className="mt-8 overflow-hidden rounded-xl border border-boxx-line bg-boxx-night sm:flex">
              <div className="relative h-40 shrink-0 sm:h-auto sm:w-44">
                {movie.posterUrl && (
                  <Image
                    src={movie.posterUrl}
                    alt=""
                    fill
                    sizes="176px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 p-5 sm:p-6">
                <p className="font-heading text-2xl tracking-wide text-boxx-white uppercase">
                  {movie.title}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  {whenLabel && (
                    <div className="col-span-2">
                      <dt className="text-xs text-boxx-dim">When</dt>
                      <dd className="text-boxx-white">{whenLabel}</dd>
                    </div>
                  )}
                  {showtime && (
                    <div>
                      <dt className="text-xs text-boxx-dim">Screen</dt>
                      <dd className="text-boxx-white">{showtime.screen}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs text-boxx-dim">Seats</dt>
                    <dd className="text-boxx-white">{tickets}</dd>
                  </div>
                </dl>
                <div className="mt-5 flex items-end justify-between gap-4 border-t border-dashed border-boxx-line pt-4">
                  <div>
                    <p className="text-xs text-boxx-dim">Reference</p>
                    <p className="font-mono text-lg font-bold tracking-wider text-boxx-white">
                      {bookScreening.data?.bookingRef}
                    </p>
                  </div>
                  <p className="font-heading text-xl text-boxx-red-glow">
                    {naira(bookScreening.data?.totalPrice ?? total)}
                  </p>
                </div>
              </div>
            </div>

            <Button
              className="mt-8 w-full"
              size="lg"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          /* ── Checkout ─────────────────────────────────────────── */
          <div className="grid sm:grid-cols-[16rem_1fr]">
            {/* Film panel */}
            <aside className="relative flex items-center gap-4 border-b border-boxx-line p-5 sm:flex-col sm:items-stretch sm:justify-end sm:gap-0 sm:border-r sm:border-b-0 sm:p-0">
              <div className="relative aspect-2/3 w-16 shrink-0 overflow-hidden rounded-md bg-boxx-slate sm:absolute sm:inset-0 sm:w-auto sm:rounded-none sm:rounded-l-2xl">
                {movie.posterUrl && (
                  <Image
                    src={movie.posterUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 64px, 256px"
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 hidden bg-linear-to-t from-boxx-night via-boxx-night/70 to-boxx-night/10 sm:block" />
              </div>

              <div className="relative min-w-0 sm:p-6">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-boxx-mist">
                  {movie.rating && (
                    <span className="rounded border border-boxx-white/40 px-1.5 py-0.5 font-bold text-boxx-white">
                      {movie.rating}
                    </span>
                  )}
                  {meta.join(" · ")}
                </div>
                <DialogTitle className="mt-2 font-heading text-2xl leading-tight tracking-wide text-boxx-white uppercase sm:text-3xl">
                  {movie.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Choose a showtime and number of seats, then add your details.
                </DialogDescription>

                {/* Order summary — desktop only, mobile shows it by the CTA */}
                <dl className="mt-6 hidden space-y-2 border-t border-boxx-white/15 pt-4 text-sm sm:block">
                  {summary.map((row) => (
                    <div key={row.label} className="flex justify-between gap-3">
                      <dt className="text-boxx-mist">{row.label}</dt>
                      <dd className="text-right text-boxx-white">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                  <div className="flex items-baseline justify-between gap-3 border-t border-boxx-white/15 pt-3">
                    <dt className="text-boxx-mist">Total</dt>
                    <dd className="font-heading text-2xl text-boxx-white">
                      {naira(total)}
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="space-y-8 p-5 sm:p-8">
                {hasShowtimes && (
                  <>
                    <Step title="Pick a day">
                      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
                        {days.map((d) => {
                          const active = d.offset === dayOffset;
                          return (
                            <button
                              key={d.offset}
                              type="button"
                              aria-pressed={active}
                              onClick={() => setDayOffset(d.offset)}
                              className={cn(
                                "flex w-14 shrink-0 flex-col items-center rounded-lg border py-2 transition-colors",
                                active
                                  ? "border-boxx-red bg-boxx-red text-boxx-white"
                                  : "border-boxx-line text-boxx-mist hover:border-boxx-white/40 hover:text-boxx-white",
                              )}
                            >
                              <span className="text-[10px] font-semibold uppercase">
                                {d.weekday === "Today" ? "Today" : d.weekday}
                              </span>
                              <span className="font-heading text-lg leading-tight">
                                {d.date}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </Step>

                    <Step title="Pick a time">
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {showtimes.map((s) => {
                          const past = isPastShowtime(s, cutoff);
                          const active = showtime?.time === s.time;
                          return (
                            <button
                              key={`${s.time}-${s.screen}`}
                              type="button"
                              disabled={past}
                              aria-pressed={active}
                              onClick={() => setTime(s.time)}
                              className={cn(
                                "flex flex-col items-center rounded-lg border px-2 py-2 transition-colors",
                                active
                                  ? "border-boxx-red bg-boxx-red/15"
                                  : "border-boxx-line hover:border-boxx-white/40",
                                past && "cursor-not-allowed opacity-35",
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
                    </Step>
                  </>
                )}

                <Step title="Seats">
                  <div className="flex items-center justify-between rounded-lg border border-boxx-line px-4 py-3">
                    <div>
                      <p className="text-sm text-boxx-white">
                        {naira(publicScreeningPricePerPerson)}{" "}
                        <span className="text-boxx-dim">per seat</span>
                      </p>
                      <p className="text-xs text-boxx-dim">
                        Popcorn and a drink included
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label="Fewer seats"
                        disabled={tickets <= 1}
                        onClick={() => setTickets((t) => Math.max(1, t - 1))}
                        className="flex size-9 items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors hover:border-boxx-white hover:text-boxx-white disabled:pointer-events-none disabled:opacity-30"
                      >
                        <HugeiconsIcon
                          icon={MinusSignIcon}
                          className="size-4"
                        />
                      </button>
                      <span className="w-6 text-center font-heading text-2xl text-boxx-white tabular-nums">
                        {tickets}
                      </span>
                      <button
                        type="button"
                        aria-label="More seats"
                        disabled={tickets >= MAX_TICKETS}
                        onClick={() =>
                          setTickets((t) => Math.min(MAX_TICKETS, t + 1))
                        }
                        className="flex size-9 items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors hover:border-boxx-white hover:text-boxx-white disabled:pointer-events-none disabled:opacity-30"
                      >
                        <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
                      </button>
                    </div>
                  </div>
                </Step>

                <Step title="Your details">
                  <div className="space-y-2">
                    <FieldLabel htmlFor="screening-name">Full name</FieldLabel>
                    <Input
                      id="screening-name"
                      autoComplete="name"
                      placeholder="Your name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <FieldLabel htmlFor="screening-email">Email</FieldLabel>
                      <Input
                        id="screening-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel htmlFor="screening-phone">
                        Phone / WhatsApp
                      </FieldLabel>
                      <Input
                        id="screening-phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+234 ..."
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </Step>
              </div>

              {/* Sticky footer */}
              <div className="sticky bottom-0 mt-auto flex items-center gap-4 border-t border-boxx-line bg-boxx-coal p-5 sm:px-8">
                <div className="sm:hidden">
                  <p className="text-xs text-boxx-dim">Total</p>
                  <p className="font-heading text-xl text-boxx-white">
                    {naira(total)}
                  </p>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={!isValid || bookScreening.isPending}
                  className="flex-1"
                >
                  {bookScreening.isPending
                    ? "Reserving…"
                    : hasShowtimes && !showtime
                      ? "Pick a time"
                      : `Reserve ${tickets} ${tickets === 1 ? "seat" : "seats"}`}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
