import type { Metadata } from "next";
import ExperiencePage from "@/components/ExperiencePage";
import { getExperience } from "@/lib/experiences";

const lounge = getExperience("lounge");

export const metadata: Metadata = {
  title: "The Lounge",
  description:
    "The Lounge is the warm center of BoxxCentral — drinks, small plates, and conversation.",
};

export default function LoungePage() {
  return <ExperiencePage experience={lounge} />;
}
