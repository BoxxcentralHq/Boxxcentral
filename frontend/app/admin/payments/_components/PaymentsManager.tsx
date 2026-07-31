"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import Reveal from "@/components/Reveal";
import type { Payment, PaymentStatus } from "@/lib/api/types";
import { usePaymentsList } from "@/lib/payments";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

const STATUS_STYLES: Record<PaymentStatus, string> = {
  success: "border-boxx-line text-boxx-white",
  pending: "border-boxx-red/40 bg-boxx-red/10 text-boxx-red-glow",
  failed: "border-boxx-line text-boxx-dim line-through",
  refunded: "border-boxx-line text-boxx-dim",
};

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
        STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}

function bookingRef(bookingId: Payment["bookingId"]) {
  if (!bookingId) return "—";
  return typeof bookingId === "string" ? bookingId.slice(-6).toUpperCase() : bookingId.bookingRef;
}

/** The payments ledger — super_admin only. Search is server-side, debounced. */
export default function PaymentsManager() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  const { data, isLoading, isError } = usePaymentsList({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
  });

  const payments = data?.payments ?? [];
  const meta = data?.meta;

  return (
    <div>
      <Reveal>
        <div className="relative sm:max-w-xs">
          <HugeiconsIcon
            icon={Search01Icon}
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-boxx-dim"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by reference…"
            aria-label="Search payments"
            className="w-full rounded-full border border-boxx-line bg-boxx-coal py-2.5 pl-11 pr-4 text-sm text-boxx-white placeholder:text-boxx-dim outline-none transition-colors duration-200 focus:border-boxx-red focus-visible:ring-[3px] focus-visible:ring-ring"
          />
        </div>
      </Reveal>

      <Reveal delay={100} className="mt-6 rounded-2xl border border-boxx-line bg-boxx-coal">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-boxx-line text-[10px] font-bold uppercase tracking-widest text-boxx-dim">
                <th className="px-6 py-4 font-bold">Reference</th>
                <th className="px-4 py-4 font-bold">Booking</th>
                <th className="px-4 py-4 font-bold">Method</th>
                <th className="px-4 py-4 font-bold">Category</th>
                <th className="px-4 py-4 text-right font-bold">Amount</th>
                <th className="px-4 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-sm text-boxx-dim">
                    Loading payments…
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-sm text-boxx-dim">
                    Couldn&apos;t load payments. Try refreshing.
                  </td>
                </tr>
              )}
              {!isLoading &&
                !isError &&
                payments.map((p) => (
                  <tr key={p._id} className="border-b border-boxx-line/50 last:border-0">
                    <td className="px-6 py-4">
                      <p className="font-mono text-xs font-semibold text-boxx-white">
                        {p.reference}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-boxx-mist">
                      {bookingRef(p.bookingId)}
                    </td>
                    <td className="px-4 py-4 text-boxx-mist">{p.paymentMethod}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-boxx-mist">
                      {p.type === "inflow" ? "Payment" : "Refund"}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-4 text-right whitespace-nowrap",
                        p.type === "inflow" ? "text-boxx-white" : "text-boxx-red-glow",
                      )}
                    >
                      {p.type === "outflow" ? "−" : ""}
                      {naira(p.amount)} {p.currency}
                    </td>
                    <td className="px-4 py-4">
                      <PaymentStatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-boxx-mist">
                      {format(parseISO(p.createdAt), "d MMM yyyy")}
                    </td>
                  </tr>
                ))}
              {!isLoading && !isError && payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-sm text-boxx-dim">
                    No payments match this view.
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
