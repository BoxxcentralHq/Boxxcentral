import type { MembershipPlan } from "./api/types";

export const gymMembershipPlans: MembershipPlan[] = [
  {
    id: "1-week",
    title: "1 Week",
    duration: "7 Days",
    price: 15000,

    description: "Perfect for trying out GymBoxx.",

    features: [
      { label: "Unlimited gym access" },
      { label: "Premium equipment" },
      { label: "Locker access" },
    ],
  },

  {
    id: "2-weeks",
    title: "2 Weeks",
    duration: "14 Days",
    price: 25000,

    description: "Great for short-term training.",

    features: [
      { label: "Unlimited gym access" },
      { label: "Premium equipment" },
      { label: "Locker access" },
    ],
  },

  {
    id: "1-month",
    title: "1 Month",
    duration: "30 Days",
    price: 45000,

    featured: true,

    subtitle: "Most Popular",

    description: "The best value for most members.",

    features: [
      { label: "Unlimited gym access" },
      { label: "Premium equipment" },
      { label: "Locker access" },
      { label: "Priority support" },
    ],
  },

  {
    id: "3-months",
    title: "3 Months",
    duration: "90 Days",
    price: 115000,

    description: "Stay consistent and save more.",

    features: [
      { label: "Unlimited gym access" },
      { label: "Premium equipment" },
      { label: "Locker access" },
      { label: "Priority support" },
    ],
  },

  {
    id: "6-months",
    title: "6 Months",
    duration: "180 Days",
    price: 230000,

    description: "Built for long-term commitment.",

    features: [
      { label: "Unlimited gym access" },
      { label: "Premium equipment" },
      { label: "Locker access" },
      { label: "Priority support" },
    ],
  },

  {
    id: "1-year",
    title: "1 Year",
    duration: "365 Days",
    price: 430000,

    description: "Maximum value for dedicated members.",

    features: [
      { label: "Unlimited gym access" },
      { label: "Premium equipment" },
      { label: "Locker access" },
      { label: "Priority support" },
    ],
  },
];