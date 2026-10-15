"use client";

import Link from "next/link";
import Reveal from "@/components/Reveal";
import { useProfile } from "@/lib/auth";
import { canAccess } from "@/lib/roles";
import { cn } from "@/lib/utils";
import OverviewStats from "./OverviewStats";
import RecentMenuItems from "./RecentMenuItems";
import RecentMessages from "./RecentMessages";
import { PanelLabel } from "./shared";

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

export default function OverviewDashboard() {
  const { data: profile } = useProfile();
  if (!profile) return null;

  const showMessages = canAccess(profile.role, "messages");
  const showMenu = canAccess(profile.role, "menu");

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewStats role={profile.role} />
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-3">
        {showMessages && (
          <Reveal
            delay={160}
            className="flex flex-col rounded-2xl border border-boxx-line bg-boxx-coal"
          >
            <PanelHeader label="Latest messages" href="/admin/messages" />
            <RecentMessages />
          </Reveal>
        )}

        {showMenu && (
          <Reveal
            delay={100}
            className={cn(
              "rounded-2xl border border-boxx-line bg-boxx-coal",
              showMessages ? "xl:col-span-2" : "xl:col-span-3",
            )}
          >
            <PanelHeader label="Recent menu items" href="/admin/menu" />
            <RecentMenuItems />
          </Reveal>
        )}
      </div>
    </>
  );
}
