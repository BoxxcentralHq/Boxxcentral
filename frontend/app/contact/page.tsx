import type { Metadata } from "next";
import Container from "@/components/Container";
import LocationMap from "@/components/LocationMap";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ContactDetails from "./_components/ContactDetails";
import ContactForm from "./_components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Find BoxxCentral — send a message, or reach us by WhatsApp, phone, and socials.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Find us. Reach us."
        description="Questions, group bookings, events — drop us a message or talk to us on WhatsApp."
      />

      {/* Message box + contact details, side by side */}
      <section className="py-24 sm:py-32">
        <Container className="grid items-start gap-10 lg:grid-cols-5 lg:gap-14">
          <Reveal className="lg:col-span-3">
            <ContactForm />
          </Reveal>
          <Reveal delay={150} className="lg:col-span-2">
            <ContactDetails />
          </Reveal>
        </Container>
      </section>

      {/* Full-width map */}
      <section className="pb-24 sm:pb-32">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="The location"
              title="One address for everything"
              lede="Cinema, gym, bowling, and lounge — all under one roof in Oshogbo."
            />
            <LocationMap
              aspect="aspect-[4/3] sm:aspect-[16/7]"
              className="mt-12"
            />
          </Reveal>
        </Container>
      </section>
    </>
  );
}
