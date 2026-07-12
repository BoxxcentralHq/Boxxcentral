import type { Metadata } from "next";
import ExperiencePage from "@/components/ExperiencePage";
import { getExperience } from "@/lib/experiences";

const bowlboxx = getExperience("bowlboxx");

export const metadata: Metadata = {
  title: "BowlBoxx — Bowling",
  description:
    "BowlBoxx is bowling the BoxxCentral way — lanes, lights, music, and friendly rivalry.",
};

export default function BowlboxxPage() {
  return <ExperiencePage experience={bowlboxx} />;
}
