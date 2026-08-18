import type { BookingStatus, GymSubscriptionStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/** Shared building blocks for admin pages. */

const statusStyles: Record<BookingStatus, string> = {
  reserved: "border-boxx-line text-boxx-white",
  pending: "border-boxx-red/40 bg-boxx-red/10 text-boxx-red-glow",
  completed: "border-boxx-line text-boxx-dim",
  cancelled: "border-boxx-line text-boxx-dim line-through",
};

const statusLabels: Record<BookingStatus, string> = {
  pending: "Awaiting payment",
  reserved: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

const gymStatusStyles: Record<GymSubscriptionStatus, string> = {
  pending: "border-boxx-line text-boxx-dim",
  // needs front-desk attention, same treatment as a booking awaiting payment
  paid: "border-boxx-red/40 bg-boxx-red/10 text-boxx-red-glow",
  active: "border-boxx-line text-boxx-white",
  expired: "border-boxx-line text-boxx-dim line-through",
};

const gymStatusLabels: Record<GymSubscriptionStatus, string> = {
  pending: "Awaiting payment",
  paid: "Awaiting activation",
  active: "Active",
  expired: "Expired",
};

export function GymSubscriptionStatusBadge({
  status,
}: {
  status: GymSubscriptionStatus;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
        gymStatusStyles[status],
      )}
    >
      {gymStatusLabels[status]}
    </span>
  );
}

export function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-boxx-dim">
      {children}
    </p>
  );
}
