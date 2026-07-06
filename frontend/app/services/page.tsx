import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ServiceCatalogue from "./_components/ServiceCatalogue";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Private cinema, gym studio, bowling, and lounge — every BoxxCentral experience at a glance.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="What's inside BoxxCentral"
        description="Every experience in the building, at a glance — tap any of them to go deeper."
      />
      <ServiceCatalogue />
    </>
  );
}
