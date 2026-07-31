"use client";

import { useId, useState } from "react";
import { Wallet01Icon } from "@hugeicons/core-free-icons";
import type { MonthlyRevenue } from "@/lib/api/types";
import EmptyState from "@/components/EmptyState";

const CHART_RED = "#fa0306";
const GRID_COLOR = "#333333"; // boxx-line — one step off the boxx-coal card surface

const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

/** Compact axis/label form: 450000 -> "₦450K", 1250000 -> "₦1.3M". */
function compactNaira(amount: number) {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₦${Math.round(amount / 1_000)}K`;
  return naira(amount);
}

/** Rounds a max value up to a clean gridline top (e.g. 450,000 -> 500,000). */
function niceMax(max: number) {
  if (max <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / magnitude) * magnitude;
}

const WIDTH = 640;
const HEIGHT = 280;
const PADDING = { top: 36, right: 12, bottom: 32, left: 56 };
const BAR_MAX_WIDTH = 24;

/**
 * Monthly revenue as a single-series bar chart — plain SVG, no charting
 * library needed for six bars. Brand red is validated for contrast against
 * the boxx-coal card surface (see dataviz skill's palette validator).
 */
export default function RevenueChart({ data }: { data: MonthlyRevenue[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const gradientId = useId();

  if (data.length === 0) {
    return (
      <EmptyState
        icon={Wallet01Icon}
        title="No revenue yet"
        description="Completed bookings will show up here."
      />
    );
  }

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const max = niceMax(Math.max(...data.map((d) => d.revenue)));
  const ticks = [0, max / 2, max];

  const slotWidth = plotWidth / data.length;
  const barWidth = Math.min(BAR_MAX_WIDTH, slotWidth * 0.5);

  const total = data.reduce((sum, d) => sum + d.revenue, 0);
  const y = (value: number) => PADDING.top + plotHeight * (1 - value / max);

  return (
    <div>
      <p className="text-xs text-boxx-dim">
        Total, last {data.length} months:{" "}
        <span className="font-semibold text-boxx-white">{naira(total)}</span>
      </p>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-4 w-full"
        role="img"
        aria-label={`Monthly revenue bar chart, ${data.map((d) => `${d.month} ${naira(d.revenue)}`).join(", ")}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_RED} />
            <stop offset="100%" stopColor={CHART_RED} stopOpacity={0.75} />
          </linearGradient>
        </defs>

        {/* Gridlines + y-axis ticks */}
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke={GRID_COLOR}
              strokeWidth={1}
            />
            <text
              x={PADDING.left - 10}
              y={y(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-boxx-dim text-[10px]"
            >
              {compactNaira(tick)}
            </text>
          </g>
        ))}

        {/* Bars */}
        {data.map((d, i) => {
          const slotX = PADDING.left + i * slotWidth;
          const barX = slotX + (slotWidth - barWidth) / 2;
          const barTop = y(d.revenue);
          const barHeight = Math.max(0, PADDING.top + plotHeight - barTop);
          const isHovered = hovered === i;
          const isLast = i === data.length - 1;

          return (
            <g key={d.month}>
              {/* transparent hit target — bigger than the painted bar */}
              <rect
                x={slotX}
                y={PADDING.top}
                width={slotWidth}
                height={plotHeight}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`${d.month}: ${naira(d.revenue)}`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered((h) => (h === i ? null : h))}
                className="cursor-pointer outline-none"
              />
              <rect
                x={barX}
                y={barTop}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={`url(#${gradientId})`}
                opacity={isHovered ? 1 : 0.9}
                className="pointer-events-none transition-opacity duration-150"
              />
              {isHovered && (
                <rect
                  x={barX - 1.5}
                  y={barTop - 1.5}
                  width={barWidth + 3}
                  height={barHeight + 3}
                  rx={5}
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity={0.35}
                  strokeWidth={1.5}
                  className="pointer-events-none"
                />
              )}
              {isLast && (
                <text
                  x={barX + barWidth / 2}
                  y={barTop - 10}
                  textAnchor="middle"
                  className="fill-boxx-white text-[11px] font-bold"
                >
                  {naira(d.revenue)}
                </text>
              )}
              <text
                x={slotX + slotWidth / 2}
                y={HEIGHT - PADDING.bottom + 20}
                textAnchor="middle"
                className="fill-boxx-dim text-[10px] uppercase tracking-wider"
              >
                {d.month}
              </text>

              {isHovered && !isLast && (
                <text
                  x={barX + barWidth / 2}
                  y={barTop - 10}
                  textAnchor="middle"
                  className="fill-boxx-white text-[11px] font-bold"
                >
                  {naira(d.revenue)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Accessible fallback — same data as the chart, for screen readers */}
      <table className="sr-only">
        <caption>Monthly revenue</caption>
        <thead>
          <tr>
            <th>Month</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.month}>
              <td>{d.month}</td>
              <td>{naira(d.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
