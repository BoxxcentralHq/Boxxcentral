import type { Metadata } from "next";
import ExperiencePage from "@/components/ExperiencePage";
import PricingCarousel from "@/components/pricing/PricingCarousel";
import { getExperience } from "@/lib/experiences";
import { gymboxxPlans } from "@/lib/gymboxx-plans";

const gymboxx = getExperience("gymboxx");

export const metadata: Metadata = {
  title: "GymBoxx — Gym Studio",
  description:
    "GymBoxx is BoxxCentral's fully equipped gym studio — modern machines, focused energy.",
};

export default function GymboxxPage() {
  return (
    <ExperiencePage experience={gymboxx}>
      <PricingCarousel
        eyebrow="Membership"
        title="Choose Your Membership"
        lede="Whether you're just getting started or training all year round, there's a plan that fits."
        plans={gymboxxPlans}
        ctaHref="/contact"
        ctaLabel="Ask About Membership"
      />
    </ExperiencePage>
  );
}
