"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toastApiError } from "@/lib/api/toast";
import type { NowShowingMovie, Showtime } from "@/lib/api/types";
import { useBuyTickets } from "@/lib/publicScreenings";
import {
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
  movie: NowShowingMovie | null;
  initialSelection?: ShowSelection;
  vatRate: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function MovieBookingDialog({
  movie,
  initialSelection,
  vatRate,
  open,
  onOpenChange,
}: MovieBookingDialogProps) {
  const nowMinute = useNowMinute();
  const [dayOffset, setDayOffset] = useState(initialSelection?.dayOffset ?? 0);
  const [showtimeId, setShowtimeId] = useState<string | null>(
    initialSelection?.showtimeId ?? null,
  );
  const [tickets, setTickets] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const buyTickets = useBuyTickets();

  const days = useMemo(
    () => (nowMinute === null ? [] : getShowDays(nowMinute)),
    [nowMinute],
  );

  if (!movie) return null;

  const cutoff = getCutoff(nowMinute, dayOffset);
  const day = days[dayOffset];
  const showtimes = showtimesOn(movie.showtimes, day?.iso);
  const isUnavailable = (s: Showtime) =>
    isPastShowtime(s, cutoff) || s.seatsLeft === 0;
  const showtime = showtimes.find(
    (s) => s._id === showtimeId && !isUnavailable(s),
  );

  const maxTickets = Math.min(MAX_TICKETS, showtime?.seatsLeft ?? MAX_TICKETS);
  const unitPrice =
    showtime?.ticketPrice ??
    lowestPrice(showtimes) ??
    lowestPrice(movie.showtimes) ??
    0;
  const subtotal = tickets * unitPrice;
  const vatAmount = Math.round(subtotal * (vatRate / 100));
  const total = subtotal + vatAmount;
  const detailsDone =
    name.trim() !== "" && email.trim() !== "" && phone.trim() !== "";
  const isValid = detailsDone && !!showtime;
  const redirecting = buyTickets.isPending || buyTickets.isSuccess;

  function pickShowtime(s: Showtime) {
    setShowtimeId(s._id);
    setTickets((t) => Math.min(t, s.seatsLeft, MAX_TICKETS));
  }

  function pickDay(offset: number) {
    setDayOffset(offset);
    setShowtimeId(null);
  }

  const meta = [
    movie.genre,
    movie.durationMins !== undefined && formatDuration(movie.durationMins),
  ].filter(Boolean);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid || !showtime) return;

    buyTickets.mutate(
      {
        screeningId: showtime._id,
        body: {
          tickets,
          guestName: name.trim(),
          guestEmail: email.trim(),
          guestPhone: phone.trim(),
        },
      },
      {
        onSuccess: (data) => {
          window.location.href = data.paymentLink;
        },
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
      value: `${tickets} × ${naira(unitPrice)}`,
    },
    vatAmount > 0 && { label: `VAT (${vatRate}%)`, value: naira(vatAmount) },
  ].filter((row): row is { label: string; value: string } => !!row);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] p-0 sm:max-w-3xl">
        <div className="grid sm:grid-cols-[16rem_1fr]">
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
              <DialogTitle
                className={cn(
                  "font-heading mt-2 text-xl leading-tight tracking-tight text-boxx-white sm:text-2xl",
                )}
              >
                {movie.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Choose a showtime and number of seats, then add your details.
              </DialogDescription>

              <dl className="mt-6 hidden space-y-2 border-t border-boxx-white/15 pt-4 text-sm sm:block">
                {summary.map((row) => (
                  <div key={row.label} className="flex justify-between gap-3">
                    <dt className="text-boxx-mist">{row.label}</dt>
                    <dd className="text-right text-boxx-white">{row.value}</dd>
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

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="space-y-8 p-5 sm:p-8">
              <Step title="Pick a day">
                <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
                  {days.map((d) => {
                    const active = d.offset === dayOffset;
                    return (
                      <button
                        key={d.offset}
                        type="button"
                        aria-pressed={active}
                        onClick={() => pickDay(d.offset)}
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
                {showtimes.length === 0 && (
                  <p className="text-sm text-boxx-dim">
                    No showings on this day — try another date.
                  </p>
                )}
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {showtimes.map((s) => {
                    const past = isPastShowtime(s, cutoff);
                    const unavailable = isUnavailable(s);
                    const active = showtime?._id === s._id;
                    return (
                      <button
                        key={s._id}
                        type="button"
                        disabled={unavailable}
                        aria-pressed={active}
                        onClick={() => pickShowtime(s)}
                        className={cn(
                          "flex flex-col items-center rounded-lg border px-2 py-2 transition-colors",
                          active
                            ? "border-boxx-red bg-boxx-red/15"
                            : "border-boxx-line hover:border-boxx-white/40",
                          unavailable && "cursor-not-allowed opacity-35",
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
                          {s.seatsLeft === 0 && !past ? "Sold out" : s.screen}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Step>

              <Step title="Seats">
                <div className="flex items-center justify-between rounded-lg border border-boxx-line px-4 py-3">
                  <div>
                    <p className="text-sm text-boxx-white">
                      {naira(unitPrice)}{" "}
                      <span className="text-boxx-dim">per seat + VAT</span>
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
                      <HugeiconsIcon icon={MinusSignIcon} className="size-4" />
                    </button>
                    <span className="w-6 text-center font-heading text-2xl text-boxx-white tabular-nums">
                      {tickets}
                    </span>
                    <button
                      type="button"
                      aria-label="More seats"
                      disabled={tickets >= maxTickets}
                      onClick={() =>
                        setTickets((t) => Math.min(maxTickets, t + 1))
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
                disabled={!isValid || redirecting}
                className="flex-1"
              >
                {redirecting
                  ? "Taking you to payment…"
                  : !showtime
                    ? "Pick a time"
                    : `Pay ${naira(total)}`}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
