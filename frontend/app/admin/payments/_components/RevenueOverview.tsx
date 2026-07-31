"use client";

import { PanelLabel } from "../../_components/shared";
import { useMonthlyRevenue } from "@/lib/payments";
import RevenueChart from "./RevenueChart";

/** Loads the last 6 months of revenue and hands it to the chart. */
export default function RevenueOverview() {
  const { data, isLoading, isError } = useMonthlyRevenue();

  return (
    <div>
      <PanelLabel>Monthly revenue</PanelLabel>
      {isLoading && (
        <p className="py-12 text-center text-sm text-boxx-dim">Loading revenue…</p>
      )}
      {isError && (
        <p className="py-12 text-center text-sm text-boxx-dim">
          Couldn&apos;t load revenue analytics.
        </p>
      )}
      {!isLoading && !isError && <RevenueChart data={data ?? []} />}
    </div>
  );
}
