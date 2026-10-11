import type { Metadata } from "next";
import BookingSection from "@/components/BookingSection";
import ExperienceShowcase from "@/components/ExperienceShowcase";
import PricingCarousel from "@/components/pricing/PricingCarousel";
import { getMovies } from "@/lib/api/server";
import { dummyMovies } from "@/lib/dummy-movies";
import { getExperience } from "@/lib/experiences";
import { filmboxxPlans } from "@/lib/filmboxx-plans";
import CinemaLobby from "./_components/CinemaLobby";

const filmboxx = getExperience("filmboxx");

export const metadata: Metadata = {
  title: "FilmBoxx — Private Cinema",
  description:
    "FilmBoxx is BoxxCentral's private cinema — book a screening room for you and yours, online with Paystack.",
};

const pricing = (
  <PricingCarousel
    eyebrow="Private cinema"
    title="FilmBoxx Packages"
    lede="Your exact total is confirmed at checkout — these are the standard room packages."
    plans={filmboxxPlans}
    ctaHref="#book"
    ctaLabel="Book This Package"
    footnote="Extra guest — ₦10,000 each"
  />
);

export default async function FilmboxxPage() {
  const catalog = await getMovies();
  /* No catalog (API down or nothing visible) — show placeholder films */
  const movies = catalog && catalog.length > 0 ? catalog : dummyMovies;

  return (
    <>
      <CinemaLobby movies={movies} fallbackVideo={filmboxx.hero.videoSrc} />
      <ExperienceShowcase experience={filmboxx} />
      {pricing}
      <BookingSection experience={filmboxx} />
    </>
  );
}
