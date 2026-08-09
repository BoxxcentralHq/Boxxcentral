import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  CheckmarkBadge01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PricingPlan } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

export default function PricingCard({
  plan,
  ctaHref,
  ctaLabel,
}: {
  plan: PricingPlan;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <article
      className={cn(
        "flex h-full w-80 shrink-0 flex-col rounded-2xl border p-8 transition-all duration-300",
        plan.featured
          ? "border-boxx-red bg-linear-to-b from-boxx-slate to-boxx-coal"
          : "border-boxx-line bg-boxx-coal hover:-translate-y-1 hover:border-boxx-red/40",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {plan.icon && (
          <div className="flex size-11 items-center justify-center rounded-xl border border-boxx-red/30 bg-boxx-red/10 text-boxx-red-glow">
            <HugeiconsIcon icon={plan.icon} aria-hidden className="size-6" />
          </div>
        )}
        {plan.featured && (
          <Badge variant="default" className="ml-auto w-fit">
            {plan.subtitle ?? "Most popular"}
          </Badge>
        )}
      </div>

      <h3
        className={cn(
          "font-heading text-2xl tracking-wide text-boxx-white uppercase",
          plan.icon || plan.featured ? "mt-5" : undefined,
        )}
      >
        {plan.title}
      </h3>
      {plan.description && (
        <p className="mt-2 text-sm leading-relaxed text-boxx-dim">
          {plan.description}
        </p>
      )}

      <div className="mt-6">
        <span className="font-heading text-4xl text-boxx-white">
          {naira(plan.price)}
        </span>
        <p className="mt-1 text-xs font-bold tracking-[0.2em] text-boxx-red-glow uppercase">
          {plan.duration}
        </p>
      </div>

      <ul className="mt-8 flex-1 space-y-3 border-t border-boxx-line pt-8">
        {plan.features.map((feature) => (
          <li
            key={feature.label}
            className="flex items-start gap-3 text-sm text-boxx-mist"
          >
            <HugeiconsIcon
              icon={CheckmarkBadge01Icon}
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-boxx-red-glow"
            />
            {feature.label}
          </li>
        ))}
      </ul>

      <Button
        asChild
        variant={plan.featured ? "default" : "outline"}
        className="mt-8 w-full"
      >
        <Link href={ctaHref}>
          {plan.buttonText ?? ctaLabel}
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            aria-hidden
            className="size-4"
          />
        </Link>
      </Button>
    </article>
  );
}
