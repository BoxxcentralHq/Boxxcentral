"use client";

import { useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { ChevronLeft, ChevronRight } from "lucide-react";

import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";

import MembershipCard from "./MembershipCard";

import type { MembershipPlan } from "@/lib/api/types";

type MembershipCarouselProps = {
  eyebrow: string;
  title: string;
  lede: string;
  plans: MembershipPlan[];
};

export default function MembershipCarousel({
  eyebrow,
  title,
  lede,
  plans,
}: MembershipCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -360 : 360,
      behavior: "smooth",
    });
  }

  return (
    <section className="py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            lede={lede}
          />
        </Reveal>

        <div className="mt-14 flex items-center justify-between">
          <div>
            <p className="text-boxx-dim">
              Choose the membership that fits your
              fitness journey.
            </p>
          </div>

          <div className="hidden gap-3 md:flex">
            <button
              onClick={() => scroll("left")}
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                border
                border-boxx-line
                bg-boxx-coal
                transition
                hover:border-boxx-red
              "
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={() => scroll("right")}
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                border
                border-boxx-line
                bg-boxx-red
                text-white
                transition
                hover:opacity-90
              "
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="
            mt-10
            flex
            gap-8
            overflow-x-auto
            scroll-smooth
            snap-x
            snap-mandatory
            pb-5

            [scrollbar-width:none]
            [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {plans.map((plan, index) => (
            <Reveal
              key={plan.id}
              delay={index * 70}
            >
              <MembershipCard
                plan={plan}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}