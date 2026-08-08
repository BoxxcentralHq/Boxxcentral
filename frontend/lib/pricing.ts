/**
 * Public-facing service pricing — client-provided price list (2026-08-08).
 * GymBoxx and BowlBoxx have no backend pricing model at all, so this is
 * static content awaiting a real data source. FilmBoxx's live booking
 * estimate is computed separately from CinemaSettings (see lib/bookings.ts)
 * using a base-price-plus-extra-seat formula — these package prices are
 * informational only; they don't feed that calculator.
 */

export type PricingPlan = {
  name: string;
  price: number;
  /** e.g. "per person" */
  unit?: string;
  /** e.g. "6 frames", "up to 6 people" */
  note?: string;
};

export type PricingGroup = {
  eyebrow: string;
  title: string;
  lede?: string;
  plans: PricingPlan[];
  /** Flat add-on charge shown below the grid, e.g. FilmBoxx's extra guest fee. */
  addOn?: string;
};

export const gymboxxPricing: PricingGroup = {
  eyebrow: "Membership",
  title: "GymBoxx Pricing",
  plans: [
    { name: "1 Week", price: 15000 },
    { name: "2 Weeks", price: 25000 },
    { name: "1 Month", price: 45000 },
    { name: "3 Months", price: 115000 },
    { name: "6 Months", price: 230000 },
    { name: "1 Year", price: 430000 },
  ],
};

export const bowlboxxPricing: PricingGroup = {
  eyebrow: "Pricing",
  title: "BowlBoxx Pricing",
  plans: [{ name: "Per Person", price: 9000, note: "6 frames" }],
};

export const filmboxxPackagePricing: PricingGroup = {
  eyebrow: "Private cinema",
  title: "FilmBoxx Packages",
  lede: "Your exact total is confirmed at checkout — these are the standard room packages.",
  plans: [
    { name: "Couples Package", price: 60000, note: "2 people" },
    { name: "Small Group", price: 90000, note: "Up to 6 people" },
    { name: "Group Package", price: 120000, note: "Up to 12 people" },
  ],
  addOn: "Extra guest — ₦10,000 each",
};

export const publicCinemaPricing: PricingGroup = {
  eyebrow: "Public screening",
  title: "Public Cinema Screening",
  lede: "Open seating, posted whenever a room isn't privately booked.",
  plans: [
    {
      name: "Per Person",
      price: 10000,
      note: "Includes complimentary popcorn and drink",
    },
  ],
};
