import type { Metadata } from "next";
import ExperiencePage from "@/components/ExperiencePage";
import { getExperience } from "@/lib/experiences";

const filmboxx = getExperience("filmboxx");

export const metadata: Metadata = {
  title: "FilmBoxx — Private Cinema",
  description:
    "FilmBoxx is BoxxCentral's private cinema — book a screening room for you and yours, online with Paystack.",
};

export default function FilmboxxPage() {
  return <ExperiencePage experience={filmboxx} />;
}
