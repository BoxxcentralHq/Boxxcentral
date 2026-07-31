"use client";

import { format, parseISO } from "date-fns";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { useBookingsList } from "@/lib/bookings";
import EmptyState from "@/components/EmptyState";
import { StatusBadge } from "./shared";

/** Latest bookings for the overview panel — first page, newest first. */
export default function RecentBookings() {
  const { data, isLoading, isError } = useBookingsList({ page: 1, limit: 5 });
  const bookings = data?.bookings ?? [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-boxx-line text-[10px] font-bold uppercase tracking-widest text-boxx-dim">
            <th className="px-6 py-3 font-bold">Guest</th>
            <th className="px-4 py-3 font-bold">When</th>
            <th className="px-4 py-3 text-right font-bold">Guests</th>
            <th className="px-6 py-3 text-right font-bold">Status</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={4} className="px-6 py-10 text-center text-sm text-boxx-dim">
                Loading…
              </td>
            </tr>
          )}
          {isError && (
            <tr>
              <td colSpan={4} className="px-6 py-10 text-center text-sm text-boxx-dim">
                Couldn&apos;t load bookings.
              </td>
            </tr>
          )}
          {!isLoading && !isError && bookings.length === 0 && (
            <tr>
              <td colSpan={4}>
                <EmptyState
                  icon={Calendar03Icon}
                  title="No bookings yet"
                  description="New bookings will show up here."
                />
              </td>
            </tr>
          )}
          {bookings.map((b) => (
            <tr key={b._id} className="border-b border-boxx-line/50 last:border-0">
              <td className="px-6 py-4">
                <p className="font-semibold text-boxx-white">{b.guestName}</p>
                <p className="mt-0.5 text-xs text-boxx-dim">{b.bookingRef}</p>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-boxx-mist">
                {format(parseISO(b.date), "EEE d MMM")} · {b.timeSlot}
              </td>
              <td className="px-4 py-4 text-right text-boxx-mist">{b.guests}</td>
              <td className="px-6 py-4 text-right">
                <StatusBadge status={b.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
