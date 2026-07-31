"use client";

import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import Reveal from "@/components/Reveal";
import type { AdminRole } from "@/lib/api/types";
import { useBookingsList } from "@/lib/bookings";
import { useMessagesList } from "@/lib/contact";
import { useMenuItemsAdmin } from "@/lib/menu";
import { canAccess } from "@/lib/roles";
import { PanelLabel } from "./shared";

const today = format(new Date(), "yyyy-MM-dd");

/** The overview stat tiles — real data from /bookings, /contact, and /menu, scoped to what this role can see. */
export default function OverviewStats({ role }: { role: AdminRole }) {
  const showBookings = canAccess(role, "bookings");
  const showMessages = canAccess(role, "messages");
  const showMenu = canAccess(role, "menu");
  // lounge_admin has neither bookings nor messages — menu stats are the
  // only numbers they'd otherwise see, so this is their overview.
  const showMenuStats = showMenu && !showBookings;

  const { data: todayData, isLoading: todayLoading } = useBookingsList(
    { date: today, limit: 100 },
    { enabled: showBookings },
  );
  const { data: pendingData, isLoading: pendingLoading } = useBookingsList(
    { status: "pending", limit: 1 },
    { enabled: showBookings },
  );
  const { data: unreadData, isLoading: unreadLoading } = useMessagesList(
    { unread: true, limit: 1 },
    { enabled: showMessages },
  );
  const { data: menuItems, isLoading: menuLoading } = useMenuItemsAdmin({
    enabled: showMenuStats,
  });

  const todaysBookings = todayData?.bookings ?? [];
  const bookingsToday = todayData?.meta.total ?? 0;
  const guestsExpected = todaysBookings.reduce((sum, b) => sum + b.guests, 0);
  const nextToday = todaysBookings
    .filter((b) => b.status !== "cancelled")
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))[0];
  const pendingCount = pendingData?.meta.total ?? 0;
  const unreadCount = unreadData?.meta.total ?? 0;
  const newestUnread = unreadData?.messages[0];
  const hiddenMenuItems = (menuItems ?? []).filter((item) => !item.visible).length;
  const menuCategoryCount = new Set((menuItems ?? []).map((item) => item.category)).size;

  const stats = [
    ...(showBookings
      ? [
          {
            label: "Bookings today",
            value: todayLoading ? "—" : String(bookingsToday),
            note: nextToday ? `next at ${nextToday.timeSlot}` : "none scheduled",
          },
          {
            label: "Guests expected",
            value: todayLoading ? "—" : String(guestsExpected),
            note: "today, across all bookings",
          },
          {
            label: "Pending approvals",
            value: pendingLoading ? "—" : String(pendingCount),
            note: "awaiting payment",
          },
        ]
      : []),
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
