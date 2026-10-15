"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, toastApiError } from "@/lib/api/toast";
import { useCinemaSettings, useUpdateCinemaSettings } from "@/lib/cinema";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-bold uppercase tracking-[0.2em] text-boxx-dim">
      {children}
    </label>
  );
}

type FormState = {
  vatRate: string;
  defaultTicketPrice: string;
  screeningBufferMins: string;
  rooms: string[];
};

type NumericKey = Exclude<keyof FormState, "rooms">;

const numericFields: { key: NumericKey; label: string; hint?: string; step: number }[] = [
  { key: "defaultTicketPrice", label: "Default ticket price (₦)", hint: "Before VAT, for new screenings", step: 1 },
  { key: "vatRate", label: "VAT rate (%)", hint: "e.g. 7.5, not 0.075", step: 0.1 },
  { key: "screeningBufferMins", label: "Gap between screenings (min)", hint: "Cleaning time kept free in each room", step: 1 },
];

export default function CinemaSettingsForm() {
  const { data: settings, isLoading, isError } = useCinemaSettings();
  const updateSettings = useUpdateCinemaSettings();

  const [form, setForm] = useState<FormState | null>(null);
  const [newRoom, setNewRoom] = useState("");
  const initialized = useRef(false);

  useEffect(() => {
    if (settings && !initialized.current) {
      setForm({
        vatRate: String(settings.vatRate),
        defaultTicketPrice: String(settings.defaultTicketPrice),
        screeningBufferMins: String(settings.screeningBufferMins),
        rooms: settings.rooms,
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

  function addRoom() {
    const room = newRoom.trim();
    if (!room || !form || form.rooms.includes(room)) return;
    setForm({ ...form, rooms: [...form.rooms, room] });
    setNewRoom("");
  }

  function removeRoom(room: string) {
    if (!form) return;
    setForm({ ...form, rooms: form.rooms.filter((r) => r !== room) });
  }

  function handleSave() {
    if (!form) return;

    updateSettings.mutate(
      {
        vatRate: Number(form.vatRate),
        defaultTicketPrice: Number(form.defaultTicketPrice),
        screeningBufferMins: Number(form.screeningBufferMins),
        rooms: form.rooms,
      },
      {
        onSuccess: () => toast.success("Settings saved"),
        onError: (error) => toastApiError(error, "Couldn't save settings. Please try again."),
      },
    );
  }

  const isValid =
    form.rooms.length > 0 &&
    numericFields.every((f) => {
      const v = Number(form[f.key]);
      return form[f.key].trim() !== "" && Number.isFinite(v) && v >= 0;
    }) &&
    Number.isInteger(Number(form.screeningBufferMins));

  return (
    <Reveal className="rounded-2xl border border-boxx-line bg-boxx-coal p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        {numericFields.map((f) => (
          <div key={f.key} className="space-y-2">
            <FieldLabel>{f.label}</FieldLabel>
            <Input
              type="number"
              min={0}
              step={f.step}
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
            {f.hint && <p className="text-xs text-boxx-dim">{f.hint}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-2">
        <FieldLabel>Rooms</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {form.rooms.map((room) => (
            <span
              key={room}
              className="inline-flex items-center gap-2 rounded-full border border-boxx-line px-3.5 py-1.5 text-xs font-bold tracking-wider text-boxx-white"
            >
              {room}
              <button
                type="button"
                onClick={() => removeRoom(room)}
                aria-label={`Remove ${room}`}
                className="cursor-pointer text-boxx-dim transition-colors duration-200 hover:text-boxx-red"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
              </button>
            </span>
          ))}
          {form.rooms.length === 0 && (
            <p className="text-xs text-boxx-dim">Add at least one room.</p>
          )}
        </div>
        <div className="flex gap-2 pt-1">
          <Input
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
            placeholder="e.g. Cinema 3"
            className="w-48"
          />
          <Button type="button" variant="outline" onClick={addRoom} disabled={!newRoom.trim()}>
            <HugeiconsIcon icon={Add01Icon} className="size-4" />
            Add room
          </Button>
        </div>
        <p className="text-xs text-boxx-dim">
          Screenings already scheduled keep their room name, so rename with care.
        </p>
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
