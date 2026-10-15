import type { Metadata } from "next";
import { getCinemaSettings, getNowShowing } from "@/lib/api/server";
import { getExperience } from "@/lib/experiences";
import CinemaLobby from "./_components/CinemaLobby";

const filmboxx = getExperience("filmboxx");

export const metadata: Metadata = {
  title: "FilmBoxx — Private Cinema",
  description:
    "FilmBoxx is BoxxCentral's private cinema — book a screening room for you and yours, online with Flutterwave.",
};

export default async function FilmboxxPage() {
  const [movies, settings] = await Promise.all([
    getNowShowing(),
    getCinemaSettings(),
  ]);

  return (
    <CinemaLobby
      movies={movies ?? []}
      vatRate={settings?.vatRate ?? 0}
      fallbackVideo={filmboxx.hero.videoSrc}
    />
  );
}
