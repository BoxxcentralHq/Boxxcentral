import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import BookingForm from "./_components/BookingForm";

export const metadata: Metadata = {
  title: "Book",
  description:
    "Build your night at BoxxCentral — combine cinema, bowling, gym, and lounge in one booking for any group size.",
};

export default function BookPage() {
  return (
    <>
      <PageHero
        eyebrow="Booking"
        title="Build your night"
        description="Pick one experience or stack a few, tell us when and how many of you are coming — we'll take care of the rest."
      />
      <BookingForm />
    </>
  );
}
