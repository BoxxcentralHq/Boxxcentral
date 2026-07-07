import type { BookingStatus } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

/** Shared building blocks for admin pages. */

const statusStyles: Record<BookingStatus, string> = {
  confirmed: "border-boxx-line text-boxx-white",
  pending: "border-boxx-red/40 bg-boxx-red/10 text-boxx-red-glow",
  cancelled: "border-boxx-line text-boxx-dim line-through",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
        statusStyles[status],
      )}
    >
      {status}
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
