"use client";

import { useMemo } from "react";
import { RestaurantIcon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { useMenuItemsAdmin } from "@/lib/menu";
import EmptyState from "@/components/EmptyState";

const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

/** Latest menu items for the overview panel — newest first, first five. */
export default function RecentMenuItems() {
  const { data: items, isLoading, isError } = useMenuItemsAdmin();

  const recent = useMemo(
    () => [...(items ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [items],
  );

  if (isLoading) {
    return <p className="px-6 py-10 text-center text-sm text-boxx-dim">Loading…</p>;
  }

  if (isError) {
    return (
      <p className="px-6 py-10 text-center text-sm text-boxx-dim">
        Couldn&apos;t load the menu.
      </p>
    );
  }

  if (recent.length === 0) {
    return (
      <EmptyState
        icon={RestaurantIcon}
        title="No menu items yet"
        description="Add a dish or drink to get started."
      />
    );
  }

  return (
    <ul>
      {recent.map((item) => (
        <li
          key={item._id}
          className="flex items-center justify-between gap-4 border-b border-boxx-line/50 px-6 py-4 last:border-0"
        >
          <div className="min-w-0">
            <p className="font-semibold text-boxx-white">{item.name}</p>
            <p className="mt-0.5 text-xs text-boxx-dim">
              {item.category} · {naira(item.price)}
            </p>
          </div>
          <Badge variant={item.visible ? "soft" : "outline"} className="shrink-0 text-[10px]">
            {item.visible ? "Visible" : "Hidden"}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
