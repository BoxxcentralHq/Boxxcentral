import { Film02Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import type { PricingPlan } from "./api/types";

export const filmboxxPlans: PricingPlan[] = [
  {
    id: "couples",
    title: "Couples Package",
    icon: Film02Icon,
    duration: "2 Guests",
    price: 60000,
    description: "An intimate session, just the two of you.",
    features: [
      { label: "Private screening room" },
      { label: "Cinema-grade picture and sound" },
      { label: "Pick any film in our catalog" },
    ],
  },
  {
    id: "small-group",
    title: "Small Group",
    icon: UserGroupIcon,
    duration: "Up to 6 Guests",
    price: 90000,
    featured: true,
    subtitle: "Most Popular",
    description: "The sweet spot for birthdays and hangouts.",
    features: [
      { label: "Private screening room" },
      { label: "Cinema-grade picture and sound" },
      { label: "Pick any film in our catalog" },
    ],
  },
  {
    id: "group",
    title: "Group Package",
    icon: UserGroupIcon,
    duration: "Up to 12 Guests",
    price: 120000,
    description: "Bring the whole crew for a premiere night.",
    features: [
      { label: "Private screening room" },
      { label: "Cinema-grade picture and sound" },
      { label: "Pick any film in our catalog" },
    ],
  },
];
