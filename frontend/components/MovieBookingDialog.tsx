"use client";

import { useState, type FormEvent } from "react";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toastApiError } from "@/lib/api/toast";
import type { Movie } from "@/lib/api/types";
import { publicScreeningPricePerPerson } from "@/lib/pricing";
import { useBookPublicScreening } from "@/lib/publicScreenings";

const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;
const MAX_TICKETS = 10;

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

type MovieBookingDialogProps = {
  /** Last-selected movie — kept truthy through the close animation so the
   *  dialog doesn't flash empty while it fades out. */
  movie: Movie | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Ticket booking for a public screening — distinct from the whole-room
 *  private booking form (BookingSection), which stays anchored at #book. */
export default function MovieBookingDialog({
  movie,
  open,
  onOpenChange,
}: MovieBookingDialogProps) {
  const [tickets, setTickets] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const bookScreening = useBookPublicScreening();

  if (!movie) return null;

  const total = tickets * publicScreeningPricePerPerson;
  const isValid = name.trim() !== "" && email.trim() !== "" && phone.trim() !== "";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid || !movie) return;

    bookScreening.mutate(
      {
        movieId: movie._id,
        movieTitle: movie.title,
        tickets,
        guestName: name.trim(),
        guestEmail: email.trim(),
        guestPhone: phone.trim(),
      },
      {
        onError: (error) =>
          toastApiError(error, "Couldn't reserve your seats. Please try again."),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="p-6">
          {bookScreening.isSuccess ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className="size-12 text-boxx-red-glow"
              />
              <div>
                <DialogTitle>Seats reserved</DialogTitle>
                <DialogDescription className="mt-2">
                  {tickets} {tickets === 1 ? "ticket" : "tickets"} for{" "}
                  <span className="text-boxx-white">{movie.title}</span> — ref{" "}
                  {bookScreening.data?.bookingRef}. We&apos;ll email you to confirm.
                </DialogDescription>
              </div>
              <Button className="mt-2 w-full" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader className="gap-2 p-0">
                <span className="text-xs font-bold tracking-[0.2em] text-boxx-red uppercase">
                  Public Cinema Screening
                </span>
                <DialogTitle>{movie.title}</DialogTitle>
                <DialogDescription>
                  {naira(publicScreeningPricePerPerson)} per person — includes
                  complimentary popcorn and drink.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div className="space-y-2">
                  <FieldLabel>Tickets</FieldLabel>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      aria-label="Fewer tickets"
                      disabled={tickets <= 1}
                      onClick={() => setTickets((t) => Math.max(1, t - 1))}
                      className="flex size-10 items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-white disabled:pointer-events-none disabled:opacity-40"
                    >
                      <HugeiconsIcon icon={MinusSignIcon} className="size-4" />
                    </button>
                    <span className="min-w-10 text-center font-heading text-2xl text-boxx-white">
                      {tickets}
                    </span>
                    <button
                      type="button"
                      aria-label="More tickets"
                      disabled={tickets >= MAX_TICKETS}
                      onClick={() => setTickets((t) => Math.min(MAX_TICKETS, t + 1))}
                      className="flex size-10 items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-white disabled:pointer-events-none disabled:opacity-40"
                    >
                      <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
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
                    <FieldLabel htmlFor="screening-phone">Phone / WhatsApp</FieldLabel>
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

                <div className="flex items-center justify-between border-t border-boxx-line pt-4 text-sm">
                  <span className="text-boxx-dim">Total</span>
                  <span className="font-heading text-xl text-boxx-red-glow">
                    {naira(total)}
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={!isValid || bookScreening.isPending}
                  className="w-full"
                  size="lg"
                >
                  {bookScreening.isPending ? "Reserving…" : "Reserve seats"}
                </Button>
              </form>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
