"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  BowlingPinsIcon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Dumbbell01Icon,
  Film02Icon,
  MinusSignIcon,
  PlusSignIcon,
  UserGroupIcon,
  WhatsappIcon,
  DrinkIcon,
} from "@hugeicons/core-free-icons";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
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
import { experiences } from "@/lib/experiences";
import { contact, site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Experience icons live here, not in lib/experiences.ts — booking-only concern. */
const experienceIcons: Record<string, IconSvgElement> = {
  filmboxx: Film02Icon,
  gymboxx: Dumbbell01Icon,
  bowlboxx: BowlingPinsIcon,
  lounge: DrinkIcon,
};

/** Hourly slots covering the venue's widest opening window (10:00–23:00). */
const timeSlots = Array.from({ length: 14 }, (_, i) => {
  const hour = (10 + i).toString().padStart(2, "0");
  return `${hour}:00`;
});

const MIN_GUESTS = 1;
const MAX_GUESTS = 50;

/** Midnight today — the earliest bookable day for the calendar. */
const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

/** Shared dark-theme styling for text-like inputs and selects. */
const fieldClass =
  "h-11 w-full rounded-xl border border-boxx-line bg-boxx-coal px-4 text-sm text-boxx-white [color-scheme:dark] placeholder:text-boxx-dim outline-none transition-colors duration-200 focus:border-boxx-red focus-visible:ring-[3px] focus-visible:ring-ring";

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

export default function BookingForm() {
  // FilmBoxx pre-selected — it's the headline, transactional experience.
  const [selected, setSelected] = useState<string[]>(["filmboxx"]);
  const [date, setDate] = useState<Date | undefined>();
  const [dateOpen, setDateOpen] = useState(false);
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const toggleService = (slug: string) =>
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );

  const selectedExperiences = experiences.filter((e) =>
    selected.includes(e.slug),
  );

  const prettyDate = useMemo(() => {
    if (!date) return "";
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, [date]);

  const isValid =
    selected.length > 0 &&
    date !== undefined &&
    time !== "" &&
    name.trim() !== "" &&
    phone.trim() !== "";

  /** Compose the booking as a WhatsApp message — the venue's booking channel. */
  const whatsappHref = useMemo(() => {
    const lines = [
      `Hello ${site.name}! I'd like to make a booking.`,
      "",
      "Experiences:",
      ...selectedExperiences.map((e) => `- ${e.name} (${e.kind})`),
      "",
      `Date: ${prettyDate || "-"}`,
      `Time: ${time || "-"}`,
      `Guests: ${guests}`,
      `Name: ${name || "-"}`,
      `Phone: ${phone || "-"}`,
    ];
    if (notes.trim()) lines.push(`Notes: ${notes.trim()}`);
    return `${contact.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [selectedExperiences, prettyDate, time, guests, name, phone, notes]);

  return (
    <section className="py-24 sm:py-32">
      <Container className="grid items-start gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
        <Reveal className="space-y-14">
          {/* Step 1 — pick one or more experiences */}
          <fieldset>
            <legend className="sr-only">Choose your experiences</legend>
            <StepHeading step={1} title="Choose your experiences" />
            <p className="mt-2 text-sm">
              Pick as many as you like — we&apos;ll line them up as one night.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {experiences.map((exp) => {
                const active = selected.includes(exp.slug);
                return (
                  <button
                    key={exp.slug}
                    type="button"
                    role="checkbox"
                    aria-checked={active}
                    onClick={() => toggleService(exp.slug)}
                    className={cn(
                      "group relative flex items-start gap-4 rounded-2xl border p-5 text-left transition-colors duration-200",
                      active
                        ? "border-boxx-red bg-boxx-coal"
                        : "border-boxx-line bg-boxx-coal/50 hover:border-boxx-dim",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-xl border transition-colors duration-200",
                        active
                          ? "border-boxx-red/40 bg-boxx-red/10 text-boxx-red-glow"
                          : "border-boxx-line text-boxx-dim",
                      )}
                    >
                      <HugeiconsIcon
                        icon={experienceIcons[exp.slug]}
                        aria-hidden
                        className="size-5"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-heading text-lg uppercase tracking-wide text-boxx-white">
                        {exp.name}
                      </span>
                      <span className="mt-1 block text-xs text-boxx-dim">
                        {exp.kind}
                      </span>
                    </span>
                    {active && (
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        aria-hidden
                        className="absolute right-4 top-4 size-5 text-boxx-red"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Step 2 — when */}
          <fieldset>
            <legend className="sr-only">Pick a date and time</legend>
            <StepHeading step={2} title="Pick a date & time" />
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
                        setDateOpen(false);
                      }}
                      disabled={{ before: startOfToday }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="booking-time">Arrival time</FieldLabel>
                <Select value={time} onValueChange={setTime}>
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
                      <SelectValue placeholder="Select a time" />
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="mt-3 text-xs text-boxx-dim">
              Open {contact.hours[0].time} Mon–Thu, later on weekends — we
              confirm exact availability with you.
            </p>
          </fieldset>

          {/* Step 3 — how many people */}
          <fieldset>
            <legend className="sr-only">How many people</legend>
            <StepHeading step={3} title="How many of you?" />
            <div className="mt-6 flex items-center gap-5">
              <button
                type="button"
                aria-label="Fewer guests"
                disabled={guests <= MIN_GUESTS}
                onClick={() => setGuests((g) => Math.max(MIN_GUESTS, g - 1))}
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
                disabled={guests >= MAX_GUESTS}
                onClick={() => setGuests((g) => Math.min(MAX_GUESTS, g + 1))}
                className="flex size-11 items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-white disabled:pointer-events-none disabled:opacity-40"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
              </button>
            </div>
            <p className="mt-3 text-xs text-boxx-dim">
              Groups larger than {MAX_GUESTS}? Message us directly — we host
              private events too.
            </p>
          </fieldset>

          {/* Step 4 — who's booking */}
          <fieldset>
            <legend className="sr-only">Your details</legend>
            <StepHeading step={4} title="Your details" />
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel htmlFor="booking-name">Full name</FieldLabel>
                <input
                  id="booking-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="booking-phone">Phone / WhatsApp</FieldLabel>
                <input
                  id="booking-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+234 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  placeholder="Birthday, film choice, table preference..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={cn(fieldClass, "h-auto py-3 leading-relaxed")}
                />
              </div>
            </div>
          </fieldset>
        </Reveal>

        {/* Sticky booking summary */}
        <Reveal delay={150} className="lg:sticky lg:top-24">
          <aside className="rounded-2xl border border-boxx-line bg-boxx-coal p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-boxx-dim">
              Your night
            </p>

            {selectedExperiences.length > 0 ? (
              <ul className="mt-5 space-y-3">
                {selectedExperiences.map((exp) => (
                  <li key={exp.slug} className="flex items-center gap-3 text-sm">
                    <HugeiconsIcon
                      icon={experienceIcons[exp.slug]}
                      aria-hidden
                      className="size-4 shrink-0 text-boxx-red"
                    />
                    <span className="text-boxx-white">{exp.name}</span>
                    <Badge variant="outline" className="ml-auto">
                      {exp.kind}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-sm text-boxx-dim">
                No experiences selected yet — pick at least one to build your
                night.
              </p>
            )}

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

            <Button
              asChild={isValid}
              disabled={!isValid}
              className="mt-8 w-full"
              size="lg"
            >
              {isValid ? (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <HugeiconsIcon icon={WhatsappIcon} className="size-4" />
                  Send booking on WhatsApp
                </a>
              ) : (
                <span>
                  <HugeiconsIcon icon={WhatsappIcon} className="size-4" />
                  Send booking on WhatsApp
                </span>
              )}
            </Button>

            <p className="mt-4 text-xs leading-relaxed text-boxx-dim">
              No payment needed now — we confirm availability and pricing with
              you on WhatsApp. Secure online payment with Paystack is coming
              soon.
            </p>
          </aside>
        </Reveal>
      </Container>
    </section>
  );
}
