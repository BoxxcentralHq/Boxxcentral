import type { Metadata } from "next";
import CinemaSettingsForm from "./_components/CinemaSettingsForm";

export const metadata: Metadata = {
  title: "Settings — Admin",
};

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-boxx-red">
        Settings
      </p>
      <h1 className="mt-2 font-heading text-3xl uppercase tracking-wide text-boxx-white sm:text-4xl">
        FilmBoxx pricing
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-boxx-mist">
        Everything the booking form and the price it quotes are built from —
        changes apply to new bookings immediately.
      </p>

      <div className="mt-8">
        <CinemaSettingsForm />
      </div>
    </div>
  );
}
