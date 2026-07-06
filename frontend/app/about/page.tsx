import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { site } from "@/lib/site";
import AboutStory from "./_components/AboutStory";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story behind BoxxCentral — four experiences, one premium destination.",
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
    </>
  );
}
