"use client";

import { useMemo, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  Clock01Icon,
  MinusSignIcon,
  PlusSignIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toastApiError } from "@/lib/api/toast";
import { useAvailability, useCinemaSettings, useCreateBooking } from "@/lib/bookings";
import type { Experience } from "@/lib/experiences";
import { contact } from "@/lib/site";
import { cn } from "@/lib/utils";

const FORM_ID = "filmboxx-booking-form";

/** Midnight today — the earliest bookable day for the calendar. */
const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

/** Shared dark-theme styling for text-like inputs and selects. */
const fieldClass =
  "h-11 w-full rounded-xl border border-boxx-line bg-boxx-coal px-4 text-sm text-boxx-white [color-scheme:dark] placeholder:text-boxx-dim outline-none transition-colors duration-200 focus:border-boxx-red focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-50";

/** Uppercase micro-label above each field. */
function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xs font-bold uppercase tracking-[0.2em] text-boxx-dim"
    >
      {children}
    </label>
  );
}

/** Numbered step heading, matching the site's eyebrow style. */
function StepHeading({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-boxx-red text-xs font-bold text-boxx-red">
        {step}
      </span>
      <h2 className="font-heading text-2xl uppercase tracking-wide text-boxx-white">
        {title}
      </h2>
    </div>
  );
}

/**
 * Booking flow embedded on the FilmBoxx page — the only bookable experience.
 * Creates the booking against the real API, then redirects the guest to the
 * Flutterwave payment link the backend returns. Pricing and time slots are
 * driven by /cinema/settings; the price shown here is an estimate — the
 * server always computes and owns the real total.
 */
export default function BookingSection({ experience }: { experience: Experience }) {
  const { data: settings, isLoading: settingsLoading, isError: settingsError } = useCinemaSettings();
  const [date, setDate] = useState<Date | undefined>();
  const [dateOpen, setDateOpen] = useState(false);
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const dateParam = date ? format(date, "yyyy-MM-dd") : undefined;
  const { data: availability } = useAvailability(dateParam);
  const createBooking = useCreateBooking();

  const maxGuests = settings?.maxGuests ?? 50;

  const prettyDate = useMemo(() => {
    if (!date) return "";
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, [date]);

  /** All configured slots until a date narrows down what's actually free. */
  const slots = useMemo(() => {
    if (availability) return availability.slots;
    return (settings?.timeSlots ?? []).map((t) => ({ time: t, available: true }));
  }, [availability, settings]);

  /** Client-side estimate only — the create-booking response carries the real total. */
  const estimate = useMemo(() => {
    if (!settings) return null;
    const extraGuests = Math.max(0, guests - settings.includedGuests);
    const subtotal = settings.basePrice + extraGuests * settings.extraSeatPrice;
    // vatRate is a percentage (e.g. 7.5), not a fraction — confirmed against staging.
    const vatAmount = subtotal * (settings.vatRate / 100);
    return { subtotal, vatAmount, totalPrice: subtotal + vatAmount };
  }, [settings, guests]);

  const isValid =
    date !== undefined &&
    time !== "" &&
    name.trim() !== "" &&
    email.trim() !== "" &&
    phone.trim() !== "";

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid || !dateParam) return;

    createBooking.mutate(
      {
        guestName: name.trim(),
        guestEmail: email.trim(),
        guestPhone: phone.trim(),
        date: dateParam,
        timeSlot: time,
        guests,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          window.location.href = data.paymentLink;
        },
        onError: (error) =>
          toastApiError(error, "Couldn't create your booking. Please try again."),
      },
    );
  }

  const bookingPaused = settings?.bookingEnabled === false;

  return (
    <section id="book" className="border-t border-boxx-line bg-boxx-coal py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Reserve your session"
            title={`Book ${experience.name}`}
            lede="Pick a date and time, tell us how many of you are coming, and we'll take you straight to payment."
          />
        </Reveal>

        {settingsLoading ? (
          <Reveal delay={100} className="mt-12 rounded-2xl border border-boxx-line bg-boxx-night p-8 text-center">
            <p className="text-sm text-boxx-dim">Loading booking details…</p>
          </Reveal>
        ) : settingsError ? (
          <Reveal delay={100} className="mt-12 rounded-2xl border border-boxx-line bg-boxx-night p-8 text-center">
            <p className="text-sm leading-relaxed text-boxx-mist">
              Couldn&apos;t load booking details right now — message us
              directly and we&apos;ll sort out your session.
            </p>
            <Button asChild className="mt-6">
              <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer">
                Message us on WhatsApp
              </a>
            </Button>
          </Reveal>
        ) : bookingPaused ? (
          <Reveal delay={100} className="mt-12 rounded-2xl border border-boxx-line bg-boxx-night p-8 text-center">
            <p className="text-sm leading-relaxed text-boxx-mist">
              Online booking is paused right now — message us directly and
              we&apos;ll sort out your session.
            </p>
            <Button asChild className="mt-6">
              <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer">
                Message us on WhatsApp
              </a>
            </Button>
          </Reveal>
        ) : (
          <div className="mt-12 grid items-start gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
            <Reveal variant="left" className="space-y-14">
              <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-14">
                {/* Step 1 — when */}
                <fieldset>
                  <legend className="sr-only">Pick a date and time</legend>
                  <StepHeading step={1} title="Pick a date & time" />
                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <FieldLabel htmlFor="booking-date">Date</FieldLabel>
                      <Popover open={dateOpen} onOpenChange={setDateOpen}>
                        <PopoverTrigger asChild>
                          <button
                            id="booking-date"
                            type="button"
                            className={cn(
                              fieldClass,
                              "flex items-center justify-between gap-2 text-left",
                              !date && "text-boxx-dim",
                            )}
                          >
                            {prettyDate || "Pick a date"}
                            <HugeiconsIcon
                              icon={Calendar03Icon}
                              aria-hidden
                              className="size-4 shrink-0 text-boxx-dim"
                            />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => {
                              setDate(d);
                              setTime("");
                              setDateOpen(false);
                            }}
                            disabled={{ before: startOfToday }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <FieldLabel htmlFor="booking-time">Arrival time</FieldLabel>
                      <Select
                        value={time}
                        onValueChange={setTime}
                        disabled={!date || slots.length === 0}
                      >
                        <SelectTrigger
                          id="booking-time"
                          className={cn(
                            "w-full rounded-xl border-boxx-line bg-boxx-coal px-4 text-sm data-[size=default]:h-11",
                            time ? "text-boxx-white" : "text-boxx-dim",
                          )}
                        >
                          <span className="flex flex-1 items-center gap-2">
                            <HugeiconsIcon
                              icon={Clock01Icon}
                              aria-hidden
                              className="size-4 shrink-0 text-boxx-dim"
                            />
                            <SelectValue
                              placeholder={date ? "Select a time" : "Pick a date first"}
                            />
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {slots.map((slot) => (
                            <SelectItem
                              key={slot.time}
                              value={slot.time}
                              disabled={!slot.available}
                            >
                              {slot.time}
                              {!slot.available && " — full"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-boxx-dim">
                    Open {contact.hours[0].time} Mon–Thu, later on weekends —
                    availability updates live as slots fill up.
                  </p>
                </fieldset>

                {/* Step 2 — how many people */}
                <fieldset>
                  <legend className="sr-only">How many people</legend>
                  <StepHeading step={2} title="How many of you?" />
                  <div className="mt-6 flex items-center gap-5">
                    <button
                      type="button"
                      aria-label="Fewer guests"
                      disabled={guests <= 1}
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      className="flex size-11 items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-white disabled:pointer-events-none disabled:opacity-40"
                    >
                      <HugeiconsIcon icon={MinusSignIcon} className="size-4" />
                    </button>
                    <span
                      aria-live="polite"
                      className="flex min-w-24 items-center justify-center gap-2 font-heading text-3xl text-boxx-white"
                    >
                      {guests}
                      <span className="text-sm font-sans uppercase tracking-wider text-boxx-dim">
                        {guests === 1 ? "guest" : "guests"}
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label="More guests"
                      disabled={guests >= maxGuests}
                      onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
                      className="flex size-11 items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-white disabled:pointer-events-none disabled:opacity-40"
                    >
                      <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-boxx-dim">
                    Groups larger than {maxGuests}? Message us directly — we
                    host private events too.
                  </p>
                </fieldset>

                {/* Step 3 — who's booking */}
                <fieldset>
                  <legend className="sr-only">Your details</legend>
                  <StepHeading step={3} title="Your details" />
                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <FieldLabel htmlFor="booking-name">Full name</FieldLabel>
                      <input
                        id="booking-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Your name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel htmlFor="booking-phone">
                        Phone / WhatsApp
                      </FieldLabel>
                      <input
                        id="booking-phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+234 ..."
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <FieldLabel htmlFor="booking-email">Email</FieldLabel>
                      <input
                        id="booking-email"
                        type="email"
                        autoComplete="email"
                        placeholder="Where we send your receipt"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <FieldLabel htmlFor="booking-notes">
                        Anything we should know? (optional)
                      </FieldLabel>
                      <textarea
                        id="booking-notes"
                        rows={3}
                        placeholder="Birthday, film choice, seating preference..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className={cn(fieldClass, "h-auto py-3 leading-relaxed")}
                      />
                    </div>
                  </div>
                </fieldset>
              </form>
            </Reveal>

            {/* Sticky booking summary */}
            <Reveal delay={150} variant="right" className="lg:sticky lg:top-24">
              <aside className="rounded-2xl border border-boxx-line bg-boxx-night p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-boxx-dim">
                  Your booking
                </p>

                <div className="mt-5 flex items-center gap-3 text-sm">
                  <span className="text-boxx-white">{experience.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    {experience.kind}
                  </Badge>
                </div>

                <dl className="mt-6 space-y-3 border-t border-boxx-line pt-6 text-sm">
                  <div className="flex items-center gap-3">
                    <HugeiconsIcon
                      icon={Calendar03Icon}
                      aria-hidden
                      className="size-4 shrink-0 text-boxx-dim"
                    />
                    <dt className="sr-only">Date</dt>
                    <dd className={date ? "text-boxx-white" : "text-boxx-dim"}>
                      {prettyDate || "Date not set"}
                    </dd>
                  </div>
                  <div className="flex items-center gap-3">
                    <HugeiconsIcon
                      icon={Clock01Icon}
                      aria-hidden
                      className="size-4 shrink-0 text-boxx-dim"
                    />
                    <dt className="sr-only">Time</dt>
                    <dd className={time ? "text-boxx-white" : "text-boxx-dim"}>
                      {time || "Time not set"}
                    </dd>
                  </div>
                  <div className="flex items-center gap-3">
                    <HugeiconsIcon
                      icon={UserGroupIcon}
                      aria-hidden
                      className="size-4 shrink-0 text-boxx-dim"
                    />
                    <dt className="sr-only">Guests</dt>
                    <dd className="text-boxx-white">
                      {guests} {guests === 1 ? "guest" : "guests"}
                    </dd>
                  </div>
                </dl>

                {estimate && (
                  <dl className="mt-6 space-y-2 border-t border-boxx-line pt-6 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="text-boxx-dim">Subtotal</dt>
                      <dd className="text-boxx-mist">{naira(estimate.subtotal)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-boxx-dim">VAT</dt>
                      <dd className="text-boxx-mist">{naira(estimate.vatAmount)}</dd>
                    </div>
                    <div className="flex items-center justify-between pt-1 text-base">
                      <dt className="font-bold text-boxx-white">Estimated total</dt>
                      <dd className="font-bold text-boxx-red-glow">
                        {naira(estimate.totalPrice)}
                      </dd>
                    </div>
                  </dl>
                )}

                <Button
                  type="submit"
                  form={FORM_ID}
                  disabled={!isValid || createBooking.isPending}
                  className="mt-8 w-full"
                  size="lg"
                >
                  {createBooking.isPending ? "Redirecting to payment…" : "Continue to payment"}
                </Button>
                <p className="mt-3 text-center text-xs text-boxx-dim">
                  You&apos;ll pay securely with Flutterwave on the next step.
                </p>
              </aside>
            </Reveal>
          </div>
        )}
      </Container>
    </section>
  );
}
