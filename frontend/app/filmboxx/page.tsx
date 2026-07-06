import type { Metadata } from "next";
import FilmboxxHero from "./_components/FilmboxxHero";
import FilmboxxShowcase from "./_components/FilmboxxShowcase";

export const metadata: Metadata = {
  title: "FilmBoxx — Private Cinema",
  description:
    "FilmBoxx is BoxxCentral's private cinema — book a screening room for you and yours, online with Paystack.",
};

export default function FilmboxxPage() {
  return (
    <>
      <FilmboxxHero />
      <FilmboxxShowcase />
    </>
  );
}
