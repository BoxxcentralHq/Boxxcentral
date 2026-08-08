import type { Metadata } from "next";
import ExperiencePage from "@/components/ExperiencePage";
import MovieShowcase from "@/components/MovieShowcase";
import PricingSection from "@/components/PricingSection";
import { getMovies } from "@/lib/api/server";
import { getExperience } from "@/lib/experiences";
import { filmboxxPackagePricing } from "@/lib/pricing";

const filmboxx = getExperience("filmboxx");

export const metadata: Metadata = {
  title: "FilmBoxx — Private Cinema",
  description:
    "FilmBoxx is BoxxCentral's private cinema — book a screening room for you and yours, online with Paystack.",
};

export default async function FilmboxxPage() {
  const movies = await getMovies();
  return (
    <ExperiencePage experience={filmboxx}>
      <MovieShowcase movies={movies} />
      <PricingSection {...filmboxxPackagePricing} />
    </ExperiencePage>
  );
}
