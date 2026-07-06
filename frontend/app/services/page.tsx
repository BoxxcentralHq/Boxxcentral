import type { Metadata } from "next";
import ServiceCatalogue from "./_components/ServiceCatalogue";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Private cinema, gym studio, bowling, and lounge — every BoxxCentral experience at a glance.",
};

export default function ServicesPage() {
  return <ServiceCatalogue />;
}
