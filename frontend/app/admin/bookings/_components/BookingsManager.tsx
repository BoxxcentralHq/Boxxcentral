"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import Reveal from "@/components/Reveal";
import { toastApiError, toast } from "@/lib/api/toast";
import type { BookingStatus } from "@/lib/api/types";
import {
  useBookingsList,
  useCancelBooking,
  useCompleteBooking,
} from "@/lib/bookings";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";
import { StatusBadge } from "../../_components/shared";

type StatusFilter = "all" | BookingStatus;

const PAGE_SIZE = 10;
const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

/** Small inline action used in the table's last column. */
function RowAction({
  children,
  tone = "neutral",
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "danger";
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40",
        tone === "danger"
          ? "border-boxx-line text-boxx-dim hover:border-boxx-red hover:text-boxx-red"
          : "border-boxx-line text-boxx-mist hover:border-boxx-red hover:text-boxx-white",
      )}
    >
      {children}
    </button>
  );
}

/** FilmBoxx bookings against the real API — cancel and complete mutate server-side. */
export default function BookingsManager() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useBookingsList({
    page,
    limit: PAGE_SIZE,
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  const cancelBooking = useCancelBooking();
  const completeBooking = useCompleteBooking();

  const meta = data?.meta;

  const filtered = useMemo(() => {
    const bookings = data?.bookings ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter((b) =>
      [b.guestName, b.guestEmail, b.guestPhone, b.bookingRef]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [data, query]);

  function handleCancel(id: string) {
    cancelBooking.mutate(id, {
      onSuccess: () => toast.success("Booking cancelled"),
      onError: (error) => toastApiError(error, "Couldn't cancel that booking."),
    });
  }

  function handleComplete(id: string) {
    completeBooking.mutate(id, {
      onSuccess: () => toast.success("Booking marked complete"),
      onError: (error) => toastApiError(error, "Couldn't update that booking."),
    });
  }

  const tabs: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "reserved", label: "Reserved" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div>
      {/* Filters */}
      <Reveal className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={cn(
                "cursor-pointer rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-200",
                statusFilter === tab.value
                  ? "bg-boxx-red/10 text-boxx-red"
                  : "text-boxx-mist hover:text-boxx-white",
              )}
            >
              {tab.label}
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
            placeholder="Search this page…"
            aria-label="Search bookings on this page"
            className="w-full rounded-full border border-boxx-line bg-boxx-coal py-2.5 pl-11 pr-4 text-sm text-boxx-white placeholder:text-boxx-dim outline-none transition-colors duration-200 focus:border-boxx-red focus-visible:ring-[3px] focus-visible:ring-ring"
          />
        </div>
      </Reveal>

      {/* Table */}
      <Reveal delay={100} className="mt-6 rounded-2xl border border-boxx-line bg-boxx-coal">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-boxx-line text-[10px] font-bold uppercase tracking-widest text-boxx-dim">
                <th className="px-6 py-4 font-bold">Booking</th>
                <th className="px-4 py-4 font-bold">When</th>
                <th className="px-4 py-4 text-right font-bold">Guests</th>
                <th className="px-4 py-4 text-right font-bold">Total</th>
                <th className="px-4 py-4 font-bold">Status</th>
                <th className="px-6 py-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-sm text-boxx-dim">
                    Loading bookings…
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-sm text-boxx-dim">
                    Couldn&apos;t load bookings. Try refreshing.
                  </td>
                </tr>
              )}
              {!isLoading && !isError &&
                filtered.map((b) => (
                  <tr
                    key={b._id}
                    className="border-b border-boxx-line/50 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-boxx-white">
                        {b.guestName}
                      </p>
                      <p className="mt-0.5 text-xs text-boxx-dim">
                        {b.bookingRef} · {b.guestEmail}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-boxx-mist">
                      {format(parseISO(b.date), "EEE d MMM")} · {b.timeSlot}
                    </td>
                    <td className="px-4 py-4 text-right text-boxx-mist">
                      {b.guests}
                    </td>
                    <td className="px-4 py-4 text-right text-boxx-mist">
                      {naira(b.totalPrice)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {b.status === "pending" && (
                          <RowAction
                            tone="danger"
                            disabled={cancelBooking.isPending}
                            onClick={() => handleCancel(b._id)}
                          >
                            Cancel
                          </RowAction>
                        )}
                        {b.status === "reserved" && (
                          <>
                            <RowAction
                              disabled={completeBooking.isPending}
                              onClick={() => handleComplete(b._id)}
                            >
                              Mark complete
                            </RowAction>
                            <RowAction
                              tone="danger"
                              disabled={cancelBooking.isPending}
                              onClick={() => handleCancel(b._id)}
                            >
                              Cancel
                            </RowAction>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              {!isLoading && !isError && filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Search01Icon}
                      title="No bookings match this view"
                      description="Try a different status filter or search term."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-boxx-line px-6 py-4 text-xs text-boxx-dim">
            <span>
              Page {meta.page} of {meta.totalPages} · {meta.total} total
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex size-8 items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-white disabled:pointer-events-none disabled:opacity-40"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
              </button>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                className="flex size-8 items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-white disabled:pointer-events-none disabled:opacity-40"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </Reveal>
    </div>
  );
}
