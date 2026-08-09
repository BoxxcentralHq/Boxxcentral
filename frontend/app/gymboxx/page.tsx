import type { Metadata } from "next";
import ExperiencePage from "@/components/ExperiencePage";
import PricingSection from "@/components/PricingSection";
import { getExperience } from "@/lib/experiences";
import { gymboxxPricing } from "@/lib/pricing";
import MembershipCarousel from "@/components/membership/MembershipCarousel";
import { gymMembershipPlans } from "@/lib/gym-membership";

const gymboxx = getExperience("gymboxx");

export const metadata: Metadata = {
  title: "GymBoxx — Gym Studio",
  description:
    "GymBoxx is BoxxCentral's fully equipped gym studio — modern machines, focused energy.",
};

export default function GymboxxPage() {
  return (
    <ExperiencePage experience={gymboxx}>
      {/* <PricingSection {...gymboxxPricing} /> */}
      <MembershipCarousel
        eyebrow="Membership"
        title="Choose Your Membership"
        lede="Whether you're just getting started or training all year round, we have a membership that suits your goals."
        plans={gymMembershipPlans}
    />
    </ExperiencePage>
  );
}
