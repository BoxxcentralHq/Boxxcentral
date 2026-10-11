import type { Metadata } from "next";
import { getMovies } from "@/lib/api/server";
import { dummyMovies } from "@/lib/dummy-movies";
import { getExperience } from "@/lib/experiences";
import CinemaLobby from "./_components/CinemaLobby";

const filmboxx = getExperience("filmboxx");

export const metadata: Metadata = {
  title: "FilmBoxx — Private Cinema",
  description:
    "FilmBoxx is BoxxCentral's private cinema — book a screening room for you and yours, online with Paystack.",
};

export default async function FilmboxxPage() {
  const catalog = await getMovies();
  /* No catalog (API down or nothing visible) — show placeholder films */
  const movies = catalog && catalog.length > 0 ? catalog : dummyMovies;

  return <CinemaLobby movies={movies} fallbackVideo={filmboxx.hero.videoSrc} />;
}
