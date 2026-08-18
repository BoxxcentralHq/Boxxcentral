import type { Metadata } from "next";
import SubscriptionsManager from "./_components/SubscriptionsManager";

export const metadata: Metadata = {
  title: "Gym Members — Admin",
};

export default function AdminGymSubscriptionsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-boxx-red">
        GymBoxx
      </p>
      <h1 className="mt-2 font-heading text-3xl uppercase tracking-wide text-boxx-white sm:text-4xl">
        Members
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-boxx-mist">
        Search for a member when they arrive to activate their pass — paying
        online doesn&apos;t start the clock, activating here does.
      </p>

      <div className="mt-8">
        <SubscriptionsManager />
      </div>
    </div>
  );
}
