"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import {
  bookings as initialBookings,
  type Booking,
  type BookingStatus,
} from "@/lib/admin-data";
import { cn } from "@/lib/utils";
import { StatusBadge } from "../../_components/shared";

type StatusFilter = "all" | BookingStatus;

/** Small inline action used in the table's last column. */
function RowAction({
  children,
  tone = "neutral",
  onClick,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "danger";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors duration-200",
        tone === "danger"
          ? "border-boxx-line text-boxx-dim hover:border-boxx-red hover:text-boxx-red"
          : "border-boxx-line text-boxx-mist hover:border-boxx-red hover:text-boxx-white",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Bookings management over the placeholder dataset. Status changes only
 * mutate local state — TODO: call the bookings API once the backend lands.
 */
export default function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const base = { all: bookings.length, confirmed: 0, pending: 0, cancelled: 0 };
    for (const b of bookings) base[b.status] += 1;
    return base;
  }, [bookings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (!q) return true;
      return [b.guestName, b.contact, b.id, b.experience]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [bookings, statusFilter, query]);

  function setStatus(id: string, status: BookingStatus) {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b)),
    );
  }

  const tabs: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "confirmed", label: "Confirmed" },
    { value: "pending", label: "Pending" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "cursor-pointer rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-200",
                statusFilter === tab.value
                  ? "bg-boxx-red/10 text-boxx-red"
                  : "text-boxx-mist hover:text-boxx-white",
              )}
            >
              {tab.label}
              <span className="ml-2 text-boxx-dim">{counts[tab.value]}</span>
            </button>
          ))}
        </div>

        <div className="relative md:w-72">
          <HugeiconsIcon
            icon={Search01Icon}
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-boxx-dim"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guest, contact, ID…"
            aria-label="Search bookings"
            className="w-full rounded-full border border-boxx-line bg-boxx-coal py-2.5 pl-11 pr-4 text-sm text-boxx-white placeholder:text-boxx-dim outline-none transition-colors duration-200 focus:border-boxx-red focus-visible:ring-[3px] focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 rounded-2xl border border-boxx-line bg-boxx-coal">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-boxx-line text-[10px] font-bold uppercase tracking-widest text-boxx-dim">
                <th className="px-6 py-4 font-bold">Booking</th>
                <th className="px-4 py-4 font-bold">Experience</th>
                <th className="px-4 py-4 font-bold">When</th>
                <th className="px-4 py-4 text-right font-bold">Guests</th>
                <th className="px-4 py-4 font-bold">Status</th>
                <th className="px-6 py-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-boxx-line/50 last:border-0"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-boxx-white">
                      {b.guestName}
                    </p>
                    <p className="mt-0.5 text-xs text-boxx-dim">
                      {b.id} · {b.contact}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-boxx-mist">{b.experience}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-boxx-mist">
                    {format(parseISO(b.date), "EEE d MMM")} · {b.time}
                  </td>
                  <td className="px-4 py-4 text-right text-boxx-mist">
                    {b.guests}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {b.status === "pending" && (
                        <>
                          <RowAction
                            onClick={() => setStatus(b.id, "confirmed")}
                          >
                            Confirm
                          </RowAction>
                          <RowAction
                            tone="danger"
                            onClick={() => setStatus(b.id, "cancelled")}
                          >
                            Decline
                          </RowAction>
                        </>
                      )}
                      {b.status === "confirmed" && (
                        <RowAction
                          tone="danger"
                          onClick={() => setStatus(b.id, "cancelled")}
                        >
                          Cancel
                        </RowAction>
                      )}
                      {b.status === "cancelled" && (
                        <RowAction onClick={() => setStatus(b.id, "pending")}>
                          Reinstate
                        </RowAction>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-14 text-center text-sm text-boxx-dim"
                  >
                    No bookings match this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
