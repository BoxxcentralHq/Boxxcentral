"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";
import { toast, toastApiError } from "@/lib/api/toast";
import type { GymSubscriptionStatus } from "@/lib/api/types";
import {
  useActivateGymSubscription,
  useGymSubscriptions,
  useSearchGymSubscriptions,
} from "@/lib/gym";
import { cn } from "@/lib/utils";
import Pagination from "../../../_components/Pagination";
import { GymSubscriptionStatusBadge } from "../../../_components/shared";

type StatusFilter = "all" | GymSubscriptionStatus;

const PAGE_SIZE = 10;
const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

function RowAction({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="cursor-pointer rounded-full border border-boxx-line px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-white disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}

/** Debounces a value — waits until the user pauses typing before it updates. */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

/** GymBoxx front desk — search a member by name/email/phone/ref to activate
 *  their pass, or browse the full membership list by status. */
export default function SubscriptionsManager() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebouncedValue(query.trim(), 350);
  const isSearching = debouncedQuery !== "";

  const list = useGymSubscriptions({
    page,
    limit: PAGE_SIZE,
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  const search = useSearchGymSubscriptions(debouncedQuery);
  const activate = useActivateGymSubscription();

  const subscriptions = isSearching ? (search.data ?? []) : (list.data?.subscriptions ?? []);
  const isLoading = isSearching ? search.isLoading : list.isLoading;
  const isError = isSearching ? search.isError : list.isError;
  const meta = isSearching ? undefined : list.data?.meta;

  function handleActivate(id: string) {
    activate.mutate(id, {
      onSuccess: () => toast.success("Membership activated"),
      onError: (error) => toastApiError(error, "Couldn't activate that membership."),
    });
  }

  const tabs: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Awaiting activation" },
    { value: "active", label: "Active" },
    { value: "expired", label: "Expired" },
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
              disabled={isSearching}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={cn(
                "cursor-pointer rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40",
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
            placeholder="Search name, email, phone, or ref…"
            aria-label="Search members"
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
                <th className="px-6 py-4 font-bold">Member</th>
                <th className="px-4 py-4 font-bold">Plan</th>
                <th className="px-4 py-4 font-bold">Valid through</th>
                <th className="px-4 py-4 font-bold">Status</th>
                <th className="px-6 py-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-sm text-boxx-dim">
                    Loading members…
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-sm text-boxx-dim">
                    Couldn&apos;t load members. Try refreshing.
                  </td>
                </tr>
              )}
              {!isLoading &&
                !isError &&
                subscriptions.map((sub) => (
                  <tr key={sub._id} className="border-b border-boxx-line/50 last:border-0">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-boxx-white">{sub.memberName}</p>
                      <p className="mt-0.5 text-xs text-boxx-dim">
                        {sub.subscriptionRef} · {sub.memberEmail}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-boxx-mist">
                      {sub.planName}
                      <span className="block text-xs text-boxx-dim">{naira(sub.price)}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-boxx-mist">
                      {sub.endDate ? format(parseISO(sub.endDate), "d MMM yyyy") : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <GymSubscriptionStatusBadge status={sub.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {sub.status === "paid" && (
                          <RowAction
                            disabled={activate.isPending}
                            onClick={() => handleActivate(sub._id)}
                          >
                            Activate
                          </RowAction>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              {!isLoading && !isError && subscriptions.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={Search01Icon}
                      title={isSearching ? "No members match that search" : "No members match this view"}
                      description={
                        isSearching
                          ? "Try a different name, email, phone, or reference."
                          : "Try a different status filter."
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {meta && (
          <Pagination page={page} totalPages={meta.totalPages} total={meta.total} onPageChange={setPage} />
        )}
      </Reveal>
    </div>
  );
}
