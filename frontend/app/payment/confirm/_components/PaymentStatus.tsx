"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { Alert02Icon, CheckmarkCircle02Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import type { PaymentVerification } from "@/lib/api/types";
import { MAX_VERIFY_WAIT_MS, usePaymentVerify } from "@/lib/payments";
import { contact } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Flutterwave's redirect carries the reference back as one of these, depending on setup. */
function readReference(params: URLSearchParams) {
  return (
    params.get("tx_ref") ?? params.get("reference") ?? params.get("transaction_id") ?? undefined
  );
}

const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

const RETRY_HREF: Record<PaymentVerification["category"], string> = {
  ticket_payment: "/filmboxx#now-showing",
  gym_subscription_payment: "/gymboxx",
  refund: "/",
};

const SUCCESS_BODY: Record<PaymentVerification["category"], string> = {
  ticket_payment:
    "Your seats are confirmed — we've emailed your tickets. Show your reference at the door.",
  gym_subscription_payment:
    "We've sent your receipt by email. Your membership doesn't start counting yet — come by the gym and show your reference at the front desk to activate it.",
  refund: "Your payment has been processed.",
};

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
      <h1 className="mt-6 font-heading text-2xl tracking-tight text-boxx-white">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed">{body}</p>
      {children}
    </div>
  );
}

function RetryActions({ href }: { href: string }) {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
      <Button asChild size="lg">
        <Link href={href}>Try again</Link>
      </Button>
      <Button asChild variant="outline" size="lg">
        <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer">
          Message us
        </a>
      </Button>
    </div>
  );
}

function ReferenceLine({ reference }: { reference: string }) {
  return (
    <p className="mt-4 font-mono text-xs text-boxx-dim">Reference: {reference}</p>
  );
}

export default function PaymentStatus() {
  const searchParams = useSearchParams();
  const reference = readReference(searchParams);
  const cancelled = searchParams.get("status") === "cancelled";
  const { data, isError, dataUpdatedAt } = usePaymentVerify(reference);
  const [openedAt] = useState(() => Date.now());

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

  const retryHref = data ? RETRY_HREF[data.category] : "/";

  if (cancelled && data?.localStatus !== "success") {
    return (
      <StatusCard
        icon={Alert02Icon}
        tone="neutral"
        title="Payment cancelled"
        body="You left the payment page before paying, so nothing was charged. You can start again whenever you're ready."
      >
        <ReferenceLine reference={reference} />
        <RetryActions href={retryHref} />
      </StatusCard>
    );
  }

  if (!data) {
    if (isError) {
      return (
        <StatusCard
          icon={Alert02Icon}
          tone="danger"
          title="We couldn't confirm this payment"
          body="If you closed the payment page before paying, nothing was charged and you can try again. If you were charged, message us with your reference and we'll sort it out."
        >
          <ReferenceLine reference={reference} />
          <RetryActions href={retryHref} />
        </StatusCard>
      );
    }
    return (
      <StatusCard
        icon={Clock01Icon}
        tone="neutral"
        spin
        title="Confirming your payment…"
        body="Hang tight — we're checking in with the payment gateway. This usually takes a few seconds."
      />
    );
  }

  if (data.localStatus === "refunded") {
    return (
      <StatusCard
        icon={Alert02Icon}
        tone="danger"
        title="Payment refunded"
        body="Your booking wasn't confirmed and your payment was refunded. Try booking again, or message us if you think this is a mistake."
      >
        <ReferenceLine reference={reference} />
        <RetryActions href={retryHref} />
      </StatusCard>
    );
  }

  if (data.localStatus === "success" && !data.needsReview) {
    return (
      <StatusCard
        icon={CheckmarkCircle02Icon}
        tone="success"
        title="Payment confirmed"
        body={SUCCESS_BODY[data.category]}
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

  if (data.needsReview) {
    return (
      <StatusCard
        icon={Alert02Icon}
        tone="danger"
        title="Payment received — we'll be in touch"
        body="Your payment came through, but we couldn't complete your booking (for example, the screening sold out while you were paying). Our team will contact you to rebook or refund you."
      >
        <ReferenceLine reference={reference} />
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline" size="lg">
            <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer">
              Message us
            </a>
          </Button>
        </div>
      </StatusCard>
    );
  }

  if (data.gatewayStatus === "successful") {
    const stillWaiting = dataUpdatedAt - openedAt < MAX_VERIFY_WAIT_MS;
    return (
      <StatusCard
        icon={stillWaiting ? Clock01Icon : CheckmarkCircle02Icon}
        tone="neutral"
        spin={stillWaiting}
        title="Payment received"
        body={
          stillWaiting
            ? "We're finalising your booking — this usually takes a few seconds. This page updates itself, no need to refresh."
            : "Your confirmation is taking longer than usual. It'll arrive by email — if it doesn't within 15 minutes, message us with your reference."
        }
      >
        <ReferenceLine reference={reference} />
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
        <ReferenceLine reference={reference} />
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
      <ReferenceLine reference={reference} />
      <RetryActions href={retryHref} />
    </StatusCard>
  );
}
