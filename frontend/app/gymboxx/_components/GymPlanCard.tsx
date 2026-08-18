import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, CheckmarkBadge01Icon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GymPlan } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

/** Same visual language as the shared PricingCard, but click-driven — picking
 *  a plan opens the subscribe dialog instead of navigating to a link, since
 *  each GymBoxx plan is its own payable SKU. */
export default function GymPlanCard({
  plan,
  onSelect,
}: {
  plan: GymPlan;
  onSelect: () => void;
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
        {plan.featured && (
          <Badge variant="default" className="ml-auto w-fit">
            {plan.subtitle ?? "Most popular"}
          </Badge>
        )}
      </div>

      <h3 className="font-heading text-2xl tracking-wide text-boxx-white uppercase">
        {plan.name}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-boxx-dim">{plan.description}</p>

      <div className="mt-6">
        <span className="font-heading text-4xl text-boxx-white">
          {naira(plan.price)}
        </span>
        <p className="mt-1 text-xs font-bold tracking-[0.2em] text-boxx-red-glow uppercase">
          {plan.durationDays} Days
        </p>
      </div>

      <ul className="mt-8 flex-1 space-y-3 border-t border-boxx-line pt-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-boxx-mist">
            <HugeiconsIcon
              icon={CheckmarkBadge01Icon}
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-boxx-red-glow"
            />
            {feature}
          </li>
        ))}
      </ul>

      <Button
        type="button"
        onClick={onSelect}
        variant={plan.featured ? "default" : "outline"}
        className="mt-8 w-full"
      >
        Subscribe
        <HugeiconsIcon icon={ArrowRight01Icon} aria-hidden className="size-4" />
      </Button>
    </article>
  );
}
