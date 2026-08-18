"use client";

import { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Dumbbell01Icon,
} from "@hugeicons/core-free-icons";
import Container from "@/components/Container";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import type { GymPlan } from "@/lib/api/types";
import { useGymPlans } from "@/lib/gym";
import { cn } from "@/lib/utils";
import GymPlanCard from "./GymPlanCard";
import GymSubscribeDialog from "./GymSubscribeDialog";

/** Matches GymPlanCard's fixed width (w-80) plus the row's gap-6. */
const SCROLL_STEP = 320 + 24;

/** GymBoxx's live membership carousel — plans come from the admin-managed
 *  catalog, and picking one opens the subscribe-and-pay dialog. */
export default function GymMembership() {
  const { data: plans, isLoading, isError } = useGymPlans();
  const [selectedPlan, setSelectedPlan] = useState<GymPlan | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const needsScroll = (plans?.length ?? 0) > 3;

  function scroll(direction: "left" | "right") {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -SCROLL_STEP : SCROLL_STEP,
      behavior: "smooth",
    });
  }

  function handleSelect(plan: GymPlan) {
    setSelectedPlan(plan);
    setDialogOpen(true);
  }

  return (
    <section id="subscribe" className="border-t border-boxx-line py-24 sm:py-32">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <SectionHeading
              eyebrow="Membership"
              title="Choose Your Membership"
              lede="Whether you're just getting started or training all year round, there's a plan that fits."
            />
          </Reveal>

          {needsScroll && (
            <Reveal delay={100} className="hidden gap-3 sm:flex">
              <button
                type="button"
                aria-label="Previous plans"
                onClick={() => scroll("left")}
                className="flex size-11 items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-white"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} aria-hidden className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Next plans"
                onClick={() => scroll("right")}
                className="flex size-11 items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-white"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} aria-hidden className="size-4" />
              </button>
            </Reveal>
          )}
        </div>

        {isLoading ? (
          <Reveal
            delay={100}
            className="mt-12 rounded-2xl border border-boxx-line bg-boxx-night p-8 text-center"
          >
            <p className="text-sm text-boxx-dim">Loading membership plans…</p>
          </Reveal>
        ) : isError ? (
          <Reveal
            delay={100}
            className="mt-12 rounded-2xl border border-dashed border-boxx-line"
          >
            <EmptyState
              icon={Dumbbell01Icon}
              title="Couldn't load membership plans"
              description="Try refreshing, or message us directly to sign up."
            />
          </Reveal>
        ) : !plans || plans.length === 0 ? (
          <Reveal
            delay={100}
            className="mt-12 rounded-2xl border border-dashed border-boxx-line"
          >
            <EmptyState
              icon={Dumbbell01Icon}
              title="Membership plans are being finalized"
              description="Check back soon, or message us directly to sign up."
            />
          </Reveal>
        ) : (
          <div
            ref={scrollRef}
            className={cn(
              "mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              !needsScroll && "sm:justify-center",
            )}
          >
            {plans.map((plan, i) => (
              <Reveal key={plan._id} delay={i * 70} className="snap-center">
                <GymPlanCard plan={plan} onSelect={() => handleSelect(plan)} />
              </Reveal>
            ))}
          </div>
        )}
      </Container>

      <GymSubscribeDialog
        plan={selectedPlan}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </section>
  );
}
