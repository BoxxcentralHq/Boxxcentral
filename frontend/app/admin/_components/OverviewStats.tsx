"use client";

import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import Reveal from "@/components/Reveal";
import { useBookingsList } from "@/lib/bookings";
import { useMessagesList } from "@/lib/contact";
import { PanelLabel } from "./shared";

const today = format(new Date(), "yyyy-MM-dd");

/** The overview stat tiles — real data from /bookings and /contact. */
export default function OverviewStats() {
  const { data: todayData, isLoading: todayLoading } = useBookingsList({
    date: today,
    limit: 100,
  });
  const { data: pendingData, isLoading: pendingLoading } = useBookingsList({
    status: "pending",
    limit: 1,
  });
  const { data: unreadData, isLoading: unreadLoading } = useMessagesList({
    unread: true,
    limit: 1,
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

  const stats = [
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
    {
      label: "Unread messages",
      value: unreadLoading ? "—" : String(unreadCount),
      note: newestUnread
        ? `newest ${formatDistanceToNowStrict(parseISO(newestUnread.createdAt), { addSuffix: true })}`
        : "inbox zero",
    },
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
