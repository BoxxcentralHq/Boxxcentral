import type { Metadata } from "next";
import PlansManager from "./_components/PlansManager";

export const metadata: Metadata = {
  title: "Gym Plans — Admin",
};

export default function AdminGymPlansPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-boxx-red">
        GymBoxx
      </p>
      <h1 className="mt-2 font-heading text-3xl uppercase tracking-wide text-boxx-white sm:text-4xl">
        Manage membership plans
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-boxx-mist">
        Add, edit, and remove membership tiers — changes here are what guests
        see and pay for on the GymBoxx page.
      </p>

      <div className="mt-8">
        <PlansManager />
      </div>
    </div>
  );
}
