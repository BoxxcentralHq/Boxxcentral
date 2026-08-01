"use client";

import Link from "next/link";
import Reveal from "@/components/Reveal";
import { useProfile } from "@/lib/auth";
import { canAccess } from "@/lib/roles";
import OverviewStats from "./OverviewStats";
import RecentBookings from "./RecentBookings";
import RecentMenuItems from "./RecentMenuItems";
import RecentMessages from "./RecentMessages";
import { PanelLabel } from "./shared";

/** Header row for an overview panel, with a link to the full page. */
function PanelHeader({ label, href }: { label: string; href: string }) {
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

/**
 * The overview's dynamic content — stat tiles and recent-activity panels,
 * scoped to what the signed-in role can actually see (mirrors the access
 * rules in lib/roles.ts). A lounge_admin has neither bookings nor messages,
 * so they get a menu-focused panel instead of an empty dashboard.
 */
export default function OverviewDashboard() {
  const { data: profile } = useProfile();
  if (!profile) return null;

  const showBookings = canAccess(profile.role, "bookings");
  const showMessages = canAccess(profile.role, "messages");
  const showMenu = canAccess(profile.role, "menu");

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewStats role={profile.role} />
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-3">
        {showBookings && (
          <Reveal
            delay={100}
            className="rounded-2xl border border-boxx-line bg-boxx-coal xl:col-span-2"
          >
            <PanelHeader label="Recent bookings" href="/admin/bookings" />
            <RecentBookings />
          </Reveal>
        )}

        {showMessages && (
          <Reveal
            delay={160}
            className="flex flex-col rounded-2xl border border-boxx-line bg-boxx-coal"
          >
            <PanelHeader label="Latest messages" href="/admin/messages" />
            <RecentMessages />
          </Reveal>
        )}

        {!showBookings && showMenu && (
          <Reveal
            delay={100}
            className="rounded-2xl border border-boxx-line bg-boxx-coal xl:col-span-3"
          >
            <PanelHeader label="Recent menu items" href="/admin/menu" />
            <RecentMenuItems />
          </Reveal>
        )}
      </div>
    </>
  );
}
