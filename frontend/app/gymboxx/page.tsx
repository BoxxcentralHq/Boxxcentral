import type { Metadata } from "next";
import ExperiencePage from "@/components/ExperiencePage";
import { getExperience } from "@/lib/experiences";

const gymboxx = getExperience("gymboxx");

export const metadata: Metadata = {
  title: "GymBoxx — Gym Studio",
  description:
    "GymBoxx is BoxxCentral's fully equipped gym studio — modern machines, focused energy.",
};

export default function GymboxxPage() {
  return <ExperiencePage experience={gymboxx} />;
}
