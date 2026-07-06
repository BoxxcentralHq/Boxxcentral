import type { Metadata } from "next";
import BowlboxxHero from "./_components/BowlboxxHero";
import BowlboxxShowcase from "./_components/BowlboxxShowcase";

export const metadata: Metadata = {
  title: "BowlBoxx — Bowling",
  description:
    "BowlBoxx is bowling the BoxxCentral way — lanes, lights, music, and friendly rivalry.",
};

export default function BowlboxxPage() {
  return (
    <>
      <BowlboxxHero />
      <BowlboxxShowcase />
    </>
  );
}
