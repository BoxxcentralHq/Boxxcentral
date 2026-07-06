import type { Metadata } from "next";
import AboutStory from "./_components/AboutStory";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story behind BoxxCentral — four experiences, one premium destination.",
};

export default function AboutPage() {
  return <AboutStory />;
}
