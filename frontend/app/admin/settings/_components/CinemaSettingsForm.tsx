"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Cancel01Icon, ToggleOffIcon, ToggleOnIcon } from "@hugeicons/core-free-icons";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, toastApiError } from "@/lib/api/toast";
import { useCinemaSettings, useUpdateCinemaSettings } from "@/lib/bookings";
import { cn } from "@/lib/utils";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-bold uppercase tracking-[0.2em] text-boxx-dim">
      {children}
    </label>
  );
}

type FormState = {
  basePrice: string;
  includedGuests: string;
  maxGuests: string;
  extraSeatPrice: string;
  sessionDurationHours: string;
  vatRate: string;
  timeSlots: string[];
  bookingEnabled: boolean;
};

export default function CinemaSettingsForm() {
  const { data: settings, isLoading, isError } = useCinemaSettings();
  const updateSettings = useUpdateCinemaSettings();

  const [form, setForm] = useState<FormState | null>(null);
  const [newSlot, setNewSlot] = useState("");
  const initialized = useRef(false);

  useEffect(() => {
    if (settings && !initialized.current) {
      setForm({
        basePrice: String(settings.basePrice),
        includedGuests: String(settings.includedGuests),
        maxGuests: String(settings.maxGuests),
        extraSeatPrice: String(settings.extraSeatPrice),
        sessionDurationHours: String(settings.sessionDurationHours),
        vatRate: String(settings.vatRate),
        timeSlots: settings.timeSlots,
        bookingEnabled: settings.bookingEnabled,
      });
      initialized.current = true;
    }
  }, [settings]);

  if (isLoading || !form) {
    return (
      <Reveal className="rounded-2xl border border-boxx-line bg-boxx-coal p-8 text-center text-sm text-boxx-dim">
        Loading settings…
      </Reveal>
    );
  }

  if (isError) {
    return (
      <Reveal className="rounded-2xl border border-boxx-line bg-boxx-coal p-8 text-center text-sm text-boxx-dim">
        Couldn&apos;t load cinema settings. Try refreshing.
      </Reveal>
    );
  }

  function addSlot() {
    const slot = newSlot.trim();
    if (!slot || !form || form.timeSlots.includes(slot)) return;
    setForm({ ...form, timeSlots: [...form.timeSlots, slot].sort() });
    setNewSlot("");
  }

  function removeSlot(slot: string) {
    if (!form) return;
    setForm({ ...form, timeSlots: form.timeSlots.filter((t) => t !== slot) });
  }

  function handleSave() {
    if (!form) return;

    updateSettings.mutate(
      {
        basePrice: Number(form.basePrice),
        includedGuests: Number(form.includedGuests),
        maxGuests: Number(form.maxGuests),
        extraSeatPrice: Number(form.extraSeatPrice),
        sessionDurationHours: Number(form.sessionDurationHours),
        vatRate: Number(form.vatRate),
        timeSlots: form.timeSlots,
        bookingEnabled: form.bookingEnabled,
      },
      {
        onSuccess: () => toast.success("Settings saved"),
        onError: (error) => toastApiError(error, "Couldn't save settings. Please try again."),
      },
    );
  }

  const numericFields: { key: keyof FormState; label: string; hint?: string }[] = [
    { key: "basePrice", label: "Base price (₦)", hint: "For the included guest count" },
    { key: "includedGuests", label: "Included guests" },
    { key: "maxGuests", label: "Max guests" },
    { key: "extraSeatPrice", label: "Extra seat price (₦)" },
    { key: "sessionDurationHours", label: "Session length (hours)" },
    { key: "vatRate", label: "VAT rate (%)", hint: "e.g. 7.5, not 0.075" },
  ];

  const isValid = numericFields.every((f) => {
    const v = Number(form[f.key]);
    return Number.isFinite(v) && v >= 0;
  });

  return (
    <Reveal className="rounded-2xl border border-boxx-line bg-boxx-coal p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-boxx-line bg-boxx-night px-5 py-4">
        <div>
          <p className="font-semibold text-boxx-white">Online booking</p>
          <p className="mt-0.5 text-xs text-boxx-dim">
            {form.bookingEnabled
              ? "Guests can book and pay online."
              : "Booking is paused — the public form points to WhatsApp instead."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setForm({ ...form, bookingEnabled: !form.bookingEnabled })}
          aria-pressed={form.bookingEnabled}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors duration-200",
            form.bookingEnabled
              ? "border-boxx-red bg-boxx-red text-boxx-white"
              : "border-boxx-line text-boxx-mist hover:border-boxx-dim hover:text-boxx-white",
          )}
        >
          <HugeiconsIcon icon={form.bookingEnabled ? ToggleOnIcon : ToggleOffIcon} className="size-4" />
          {form.bookingEnabled ? "On" : "Off"}
        </button>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {numericFields.map((f) => (
          <div key={f.key} className="space-y-2">
            <FieldLabel>{f.label}</FieldLabel>
            <Input
              type="number"
              min={0}
              step={f.key === "vatRate" ? 0.1 : 1}
              value={form[f.key] as string}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
            {f.hint && <p className="text-xs text-boxx-dim">{f.hint}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-2">
        <FieldLabel>Time slots</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {form.timeSlots.map((slot) => (
            <span
              key={slot}
              className="inline-flex items-center gap-2 rounded-full border border-boxx-line px-3.5 py-1.5 text-xs font-bold tracking-wider text-boxx-white"
            >
              {slot}
              <button
                type="button"
                onClick={() => removeSlot(slot)}
                aria-label={`Remove ${slot}`}
                className="cursor-pointer text-boxx-dim transition-colors duration-200 hover:text-boxx-red"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
              </button>
            </span>
          ))}
          {form.timeSlots.length === 0 && (
            <p className="text-xs text-boxx-dim">No time slots yet — add one below.</p>
          )}
        </div>
        <div className="flex gap-2 pt-1">
          <Input
            type="time"
            value={newSlot}
            onChange={(e) => setNewSlot(e.target.value)}
            className="w-40"
          />
          <Button type="button" variant="outline" onClick={addSlot} disabled={!newSlot}>
            <HugeiconsIcon icon={Add01Icon} className="size-4" />
            Add slot
          </Button>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={!isValid || updateSettings.isPending}
        size="lg"
        className="mt-8 w-full sm:w-auto"
      >
        {updateSettings.isPending ? "Saving…" : "Save changes"}
      </Button>
    </Reveal>
  );
}
