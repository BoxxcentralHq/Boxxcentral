import type { Metadata } from "next";
import LoungeHero from "./_components/LoungeHero";
import LoungeShowcase from "./_components/LoungeShowcase";

export const metadata: Metadata = {
  title: "The Lounge",
  description:
    "The Lounge is the warm center of BoxxCentral — drinks, small plates, and conversation.",
};

export default function LoungePage() {
  return (
    <>
      <LoungeHero />
      <LoungeShowcase />
    </>
  );
}
