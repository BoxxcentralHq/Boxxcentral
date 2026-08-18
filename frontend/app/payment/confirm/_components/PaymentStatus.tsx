"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { Alert02Icon, CheckmarkCircle02Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { usePaymentVerify } from "@/lib/payments";
import { contact } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Flutterwave's redirect carries the reference back as one of these, depending on setup. */
function readReference(params: URLSearchParams) {
  return (
    params.get("tx_ref") ?? params.get("reference") ?? params.get("transaction_id") ?? undefined
  );
}

const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

function StatusCard({
  icon,
  tone,
  spin = false,
  title,
  body,
  children,
}: {
  icon: IconSvgElement;
  tone: "neutral" | "success" | "danger";
  spin?: boolean;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  const toneClass = {
    neutral: "border-boxx-line text-boxx-dim",
    success: "border-boxx-red/40 bg-boxx-red/10 text-boxx-red-glow",
    danger: "border-boxx-red/40 bg-boxx-red/10 text-boxx-red-glow",
  }[tone];

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-boxx-line bg-boxx-coal p-8 text-center sm:p-10">
      <span
        className={cn(
          "mx-auto flex size-14 items-center justify-center rounded-full border",
          toneClass,
        )}
      >
        <HugeiconsIcon icon={icon} className={cn("size-6", spin && "animate-spin")} />
      </span>
      <h1 className="mt-6 font-heading text-2xl uppercase tracking-wide text-boxx-white">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed">{body}</p>
      {children}
    </div>
  );
}

export default function PaymentStatus() {
  const searchParams = useSearchParams();
  const reference = readReference(searchParams);
  const { data, isLoading, isError } = usePaymentVerify(reference);

  if (!reference) {
    return (
      <StatusCard
        icon={Alert02Icon}
        tone="neutral"
        title="No payment reference"
        body="This page is meant to be reached from the payment redirect. If you just paid and landed here another way, check your email for confirmation or message us directly."
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="default" size="lg">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </StatusCard>
    );
  }

  if ((isLoading && !data) || isError || !data) {
    return (
      <StatusCard
        icon={isError ? Alert02Icon : Clock01Icon}
        tone={isError ? "danger" : "neutral"}
        spin={!isError}
        title={isError ? "Couldn't check your payment" : "Confirming your payment…"}
        body={
          isError
            ? "Something went wrong reaching our server. If you were charged, don't worry — message us with your reference and we'll confirm your booking."
            : "Hang tight — we're checking in with the payment gateway. This usually takes a few seconds."
        }
      >
        {isError && (
          <p className="mt-4 font-mono text-xs text-boxx-dim">Reference: {reference}</p>
        )}
      </StatusCard>
    );
  }

  if (data.localStatus === "refunded") {
    return (
      <StatusCard
        icon={Alert02Icon}
        tone="danger"
        title="Payment refunded"
        body="Your booking wasn't confirmed. No charge should be outstanding — try booking again, or message us if you think this is a mistake."
      >
        <p className="mt-4 font-mono text-xs text-boxx-dim">Reference: {reference}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/filmboxx#book">Try again</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer">
              Message us
            </a>
          </Button>
        </div>
      </StatusCard>
    );
  }

  if (data.gatewayStatus === "pending") {
    return (
      <StatusCard
        icon={Clock01Icon}
        tone="neutral"
        spin
        title="Still confirming…"
        body="The payment gateway hasn't settled yet — this page will update itself automatically, no need to refresh."
      >
        <p className="mt-4 font-mono text-xs text-boxx-dim">Reference: {reference}</p>
      </StatusCard>
    );
  }

  if (data.gatewayStatus === "successful") {
    const isGymSubscription = data.category === "gym_subscription_payment";
    return (
      <StatusCard
        icon={CheckmarkCircle02Icon}
        tone="success"
        title="Payment confirmed"
        body={
          isGymSubscription
            ? "We've sent your receipt by email. Your membership doesn't start counting yet — come by the gym and show your reference at the front desk to activate it."
            : "Your booking is locked in — we've sent the details to your email. See you soon."
        }
      >
        <p className="mt-4 text-sm text-boxx-white">
          {naira(data.amount)} {data.currency}
        </p>
        <p className="mt-1 font-mono text-xs text-boxx-dim">Reference: {reference}</p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/">Back home</Link>
        </Button>
      </StatusCard>
    );
  }

  return (
    <StatusCard
      icon={Alert02Icon}
      tone="danger"
      title="Payment didn't go through"
      body="Your booking wasn't confirmed. No charge should be outstanding — try booking again, or message us if you think this is a mistake."
    >
      <p className="mt-4 font-mono text-xs text-boxx-dim">Reference: {reference}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link href="/filmboxx#book">Try again</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer">
            Message us
          </a>
        </Button>
      </div>
    </StatusCard>
  );
}
