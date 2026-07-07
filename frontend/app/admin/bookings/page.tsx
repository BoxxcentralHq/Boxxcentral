import type { Metadata } from "next";
import BookingsManager from "./_components/BookingsManager";

export const metadata: Metadata = {
  title: "Bookings — Admin",
};

export default function AdminBookingsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-boxx-red">
        Bookings
      </p>
      <h1 className="mt-2 font-heading text-3xl uppercase tracking-wide text-boxx-white sm:text-4xl">
        Manage bookings
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-boxx-mist">
        Confirm pending requests, cancel no-shows, and keep the day&apos;s
        schedule honest.
      </p>

      <div className="mt-8">
        <BookingsManager />
      </div>
    </div>
  );
}
