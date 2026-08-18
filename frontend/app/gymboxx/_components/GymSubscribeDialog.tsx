"use client";

import { useState, type FormEvent } from "react";
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
import type { GymPlan } from "@/lib/api/types";
import { useCreateGymSubscription } from "@/lib/gym";

const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

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

type GymSubscribeDialogProps = {
  /** Last-selected plan — kept truthy through the close animation so the
   *  dialog doesn't flash empty while it fades out. */
  plan: GymPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Collects member details, creates the subscription, then hands off to
 *  Flutterwave — same one-time-payment shape as BookingSection. */
export default function GymSubscribeDialog({
  plan,
  open,
  onOpenChange,
}: GymSubscribeDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const createSubscription = useCreateGymSubscription();

  if (!plan) return null;

  const isValid = name.trim() !== "" && email.trim() !== "" && phone.trim() !== "";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid || !plan) return;

    createSubscription.mutate(
      {
        memberName: name.trim(),
        memberEmail: email.trim(),
        memberPhone: phone.trim(),
        planId: plan._id,
      },
      {
        onSuccess: (data) => {
          window.location.href = data.paymentLink;
        },
        onError: (error) =>
          toastApiError(error, "Couldn't start your subscription. Please try again."),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="p-6">
          <DialogHeader className="gap-2 p-0">
            <span className="text-xs font-bold tracking-[0.2em] text-boxx-red uppercase">
              GymBoxx Membership
            </span>
            <DialogTitle>{plan.name}</DialogTitle>
            <DialogDescription>
              {naira(plan.price)} — {plan.durationDays} days of access from the day you
              subscribe.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <FieldLabel htmlFor="gym-name">Full name</FieldLabel>
                <Input
                  id="gym-name"
                  autoComplete="name"
                  placeholder="Your name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="gym-email">Email</FieldLabel>
                <Input
                  id="gym-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="gym-phone">Phone / WhatsApp</FieldLabel>
                <Input
                  id="gym-phone"
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
                {naira(plan.price)}
              </span>
            </div>

            <Button
              type="submit"
              disabled={!isValid || createSubscription.isPending}
              className="w-full"
              size="lg"
            >
              {createSubscription.isPending
                ? "Redirecting to payment…"
                : "Continue to payment"}
            </Button>
            <p className="text-center text-xs text-boxx-dim">
              You&apos;ll pay securely with Flutterwave on the next step.
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
