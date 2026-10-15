"use client";

import { formatDistanceToNowStrict, parseISO } from "date-fns";
import Reveal from "@/components/Reveal";
import type { AdminRole } from "@/lib/api/types";
import { useMessagesList } from "@/lib/contact";
import { useMenuItemsAdmin } from "@/lib/menu";
import { canAccess } from "@/lib/roles";
import { PanelLabel } from "./shared";

/** The overview stat tiles — real data from /contact and /menu, scoped to what this role can see. */
export default function OverviewStats({ role }: { role: AdminRole }) {
  const showMessages = canAccess(role, "messages");
  const showMenu = canAccess(role, "menu");
  const showMenuStats = showMenu;

  const { data: unreadData, isLoading: unreadLoading } = useMessagesList(
    { unread: true, limit: 1 },
    { enabled: showMessages },
  );
  const { data: menuItems, isLoading: menuLoading } = useMenuItemsAdmin({
    enabled: showMenuStats,
  });
  const unreadCount = unreadData?.meta?.total ?? 0;
  const newestUnread = unreadData?.messages?.[0];
  const hiddenMenuItems = (menuItems ?? []).filter((item) => !item.visible).length;
  const menuCategoryCount = new Set((menuItems ?? []).map((item) => item.category)).size;

  const stats = [
    ...(showMessages
      ? [
          {
            label: "Unread messages",
            value: unreadLoading ? "—" : String(unreadCount),
            note: newestUnread
              ? `newest ${formatDistanceToNowStrict(parseISO(newestUnread.createdAt), { addSuffix: true })}`
              : "inbox zero",
          },
        ]
      : []),
    ...(showMenuStats
      ? [
          {
            label: "Menu items",
            value: menuLoading ? "—" : String((menuItems ?? []).length),
            note: menuLoading ? "" : `across ${menuCategoryCount} ${menuCategoryCount === 1 ? "category" : "categories"}`,
          },
          {
            label: "Hidden items",
            value: menuLoading ? "—" : String(hiddenMenuItems),
            note: "off the public menu",
          },
        ]
      : []),
  ];

  return (
    <>
      {stats.map((stat, i) => (
        <Reveal key={stat.label} delay={i * 80}>
          <div className="rounded-2xl border border-boxx-line bg-boxx-coal p-5">
            <PanelLabel>{stat.label}</PanelLabel>
            <p className="mt-3 font-heading text-4xl text-boxx-white">
              {stat.value}
            </p>
            <p className="mt-1.5 text-xs text-boxx-dim">{stat.note}</p>
          </div>
        </Reveal>
      ))}
    </>
  );
}
