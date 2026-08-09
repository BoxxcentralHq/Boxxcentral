import { BowlingPinsIcon } from "@hugeicons/core-free-icons";
import type { PricingPlan } from "./api/types";

export const bowlboxxPlans: PricingPlan[] = [
  {
    id: "per-person",
    title: "Per Person",
    icon: BowlingPinsIcon,
    duration: "6 Frames",
    price: 9000,
    description: "Everything you need for a full game.",
    features: [
      { label: "6 frames per person" },
      { label: "Full lane access with live scoring" },
      { label: "Music and lights included" },
    ],
  },
];
