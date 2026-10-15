import type { GymSubscriptionStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/** Shared building blocks for admin pages. */

const gymStatusStyles: Record<GymSubscriptionStatus, string> = {
  pending: "border-boxx-line text-boxx-dim",
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
