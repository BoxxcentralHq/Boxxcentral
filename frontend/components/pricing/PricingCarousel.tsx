"use client";

import { useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import Container from "@/components/Container";
import PricingCard from "@/components/pricing/PricingCard";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import type { PricingPlan } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/** Matches PricingCard's fixed width (w-80) plus the row's gap-6. */
const SCROLL_STEP = 320 + 24;

type PricingCarouselProps = {
  eyebrow: string;
  title: string;
  lede: string;
  plans: PricingPlan[];
  ctaHref: string;
  ctaLabel: string;
  /** Flat print below the cards, e.g. FilmBoxx's per-extra-guest charge. */
  footnote?: string;
};

/** Service pricing, shared by GymBoxx, BowlBoxx, and FilmBoxx's package tiers. */
export default function PricingCarousel({
  eyebrow,
  title,
  lede,
  plans,
  ctaHref,
  ctaLabel,
  footnote,
}: PricingCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const needsScroll = plans.length > 3;

  function scroll(direction: "left" | "right") {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -SCROLL_STEP : SCROLL_STEP,
      behavior: "smooth",
    });
  }

  return (
    <section className="border-t border-boxx-line py-24 sm:py-32">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <SectionHeading eyebrow={eyebrow} title={title} lede={lede} />
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

        <div
          ref={scrollRef}
          className={cn(
            "mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            !needsScroll && "sm:justify-center",
          )}
        >
          {plans.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 70} className="snap-center">
              <PricingCard plan={plan} ctaHref={ctaHref} ctaLabel={ctaLabel} />
            </Reveal>
          ))}
        </div>

        {footnote && <p className="mt-6 text-sm text-boxx-dim">{footnote}</p>}
      </Container>
    </section>
  );
}
