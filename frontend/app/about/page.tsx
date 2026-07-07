import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { site } from "@/lib/site";
import AboutStory from "./_components/AboutStory";
import AboutValues from "./_components/AboutValues";
import AboutWorlds from "./_components/AboutWorlds";
import AboutNight from "./_components/AboutNight";
import AboutCta from "./_components/AboutCta";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story behind BoxxCentral — private cinema, gym studio, bowling, and lounge brought together as one premium destination in Osogbo.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow={`About ${site.name}`}
        title="One roof. Four worlds."
        description={site.description}
      />
      <AboutStory />
      <AboutValues />
      <AboutWorlds />
      <AboutNight />
      <AboutCta />
    </>
  );
}
