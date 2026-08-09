"use client";

import { Check, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { MembershipPlan } from "@/lib/api/types";

function formatNaira(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

type MembershipCardProps = {
  plan: MembershipPlan;
};

export default function MembershipCard({
  plan,
}: MembershipCardProps) {
  return (
    <article
      className={`
        group
        relative
        flex
        h-full
        min-h-[540px]
        w-[340px]
        shrink-0
        snap-center
        flex-col
        overflow-hidden
        rounded-[32px]
        border
        transition-all
        duration-500

        ${
          plan.featured
            ? `
              scale-105
              border-boxx-red
              bg-gradient-to-b
              from-[#171717]
              to-[#0D0D0D]
            `
            : `
              border-boxx-line
              bg-boxx-coal
              hover:-translate-y-2
              hover:border-boxx-red/40
            `
        }
      `}
    >
      {/* Badge */}

      {plan.featured && (
        <div className="absolute right-5 top-5 rounded-full bg-boxx-red px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-white">
          Most Popular
        </div>
      )}

      {/* Header */}

      <div className="px-8 pt-10">
        <p className="text-sm uppercase tracking-[0.35em] text-boxx-red">
          Membership
        </p>

        <h3 className="mt-3 font-heading text-4xl text-boxx-white">
          {plan.title}
        </h3>

        <p className="mt-2 text-boxx-dim">
          {plan.description}
        </p>
      </div>

      {/* Price */}

      <div className="mt-10 px-8">
        <h2 className="font-heading text-5xl text-boxx-white">
          {formatNaira(plan.price)}
        </h2>

        <p className="mt-2 text-sm uppercase tracking-wider text-boxx-red">
          {plan.duration}
        </p>
      </div>

      {/* Divider */}

      <div className="mx-8 my-8 border-t border-boxx-line" />

      {/* Features */}

      <div className="flex-1 space-y-5 px-8">
        {plan.features.map((feature) => (
          <div
            key={feature.label}
            className="flex items-center gap-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-boxx-red/10">
              <Check
                className="h-4 w-4 text-boxx-red"
                strokeWidth={3}
              />
            </div>

            <span className="text-boxx-white">
              {feature.label}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}

      <div className="p-8">
        <Button
          className={`
            w-full
            rounded-xl

            ${
              plan.featured
                ? ""
                : "bg-boxx-white text-boxx-black hover:bg-boxx-white/90"
            }
          `}
        >
          Join Membership

          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </div>
    </article>
  );
}