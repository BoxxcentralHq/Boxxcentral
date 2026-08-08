import type { Metadata } from "next";
import ExperiencePage from "@/components/ExperiencePage";
import PricingSection from "@/components/PricingSection";
import { getExperience } from "@/lib/experiences";
import { bowlboxxPricing } from "@/lib/pricing";

const bowlboxx = getExperience("bowlboxx");

export const metadata: Metadata = {
  title: "BowlBoxx — Bowling",
  description:
    "BowlBoxx is bowling the BoxxCentral way — lanes, lights, music, and friendly rivalry.",
};

export default function BowlboxxPage() {
  return (
    <ExperiencePage experience={bowlboxx}>
      <PricingSection {...bowlboxxPricing} />
    </ExperiencePage>
  );
}
