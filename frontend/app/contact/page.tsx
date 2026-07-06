import type { Metadata } from "next";
import ContactDetails from "./_components/ContactDetails";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Find BoxxCentral — address, opening hours, WhatsApp, and socials.",
};

export default function ContactPage() {
  return <ContactDetails />;
}
