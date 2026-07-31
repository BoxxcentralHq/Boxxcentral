import Link from "next/link";
import Reveal from "@/components/Reveal";
import OverviewStats from "./_components/OverviewStats";
import RecentBookings from "./_components/RecentBookings";
import RecentMessages from "./_components/RecentMessages";
import { PanelLabel } from "./_components/shared";

/** Header row for an overview panel, with a link to the full page. */
function PanelHeader({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-boxx-line px-6 py-5">
      <PanelLabel>{label}</PanelLabel>
      <Link
        href={href}
        className="text-[10px] font-bold uppercase tracking-widest text-boxx-mist transition-colors duration-200 hover:text-boxx-red"
      >
        View all →
      </Link>
    </div>
  );
}

export default function AdminOverviewPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <Reveal>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-boxx-red">
          Overview
        </p>
        <h1 className="mt-2 font-heading text-3xl uppercase tracking-wide text-boxx-white sm:text-4xl">
          Today at a glance
        </h1>
      </Reveal>

      {/* Stat tiles */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewStats />
      </div>

      <div className="mt-10 grid items-start gap-6 xl:grid-cols-3">
        {/* Recent bookings */}
        <Reveal
          delay={100}
          className="rounded-2xl border border-boxx-line bg-boxx-coal xl:col-span-2"
        >
          <PanelHeader label="Recent bookings" href="/admin/bookings" />
          <RecentBookings />
        </Reveal>

        {/* Latest messages */}
        <Reveal
          delay={160}
          className="rounded-2xl border border-boxx-line bg-boxx-coal"
        >
          <PanelHeader label="Latest messages" href="/admin/messages" />
          <RecentMessages />
        </Reveal>
      </div>
    </div>
  );
}
