import type { Metadata } from "next";
import ExperiencePage from "@/components/ExperiencePage";
import MovieShowcase from "@/components/MovieShowcase";
import PricingCarousel from "@/components/pricing/PricingCarousel";
import { getMovies } from "@/lib/api/server";
import { getExperience } from "@/lib/experiences";
import { filmboxxPlans } from "@/lib/filmboxx-plans";

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
      <PricingCarousel
        eyebrow="Private cinema"
        title="FilmBoxx Packages"
        lede="Your exact total is confirmed at checkout — these are the standard room packages."
        plans={filmboxxPlans}
        ctaHref="#book"
        ctaLabel="Book This Package"
        footnote="Extra guest — ₦10,000 each"
      />
    </ExperiencePage>
  );
}
