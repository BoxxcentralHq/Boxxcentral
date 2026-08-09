import type { Metadata } from "next";
import ExperiencePage from "@/components/ExperiencePage";
import PricingCarousel from "@/components/pricing/PricingCarousel";
import { getExperience } from "@/lib/experiences";
import { bowlboxxPlans } from "@/lib/bowlboxx-plans";

const bowlboxx = getExperience("bowlboxx");

export const metadata: Metadata = {
  title: "BowlBoxx — Bowling",
  description:
    "BowlBoxx is bowling the BoxxCentral way — lanes, lights, music, and friendly rivalry.",
};

export default function BowlboxxPage() {
  return (
    <ExperiencePage experience={bowlboxx}>
      <PricingCarousel
        eyebrow="Pricing"
        title="Game Night Pricing"
        lede="Straightforward pricing per player — grab your crew and go."
        plans={bowlboxxPlans}
        ctaHref="/contact"
        ctaLabel="Plan a Game Night"
      />
    </ExperiencePage>
  );
}
