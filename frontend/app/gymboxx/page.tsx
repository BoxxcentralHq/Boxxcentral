import type { Metadata } from "next";
import GymboxxHero from "./_components/GymboxxHero";
import GymboxxShowcase from "./_components/GymboxxShowcase";

export const metadata: Metadata = {
  title: "GymBoxx — Gym Studio",
  description:
    "GymBoxx is BoxxCentral's fully equipped gym studio — modern machines, focused energy.",
};

export default function GymboxxPage() {
  return (
    <>
      <GymboxxHero />
      <GymboxxShowcase />
    </>
  );
}
