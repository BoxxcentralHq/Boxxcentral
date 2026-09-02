"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  BeerIcon,
  BottleWineIcon,
  Cancel01Icon,
  CroissantIcon,
  CupSodaIcon,
  DrinkIcon,
  GlassWaterIcon,
  GridViewIcon,
  ListViewIcon,
  Pizza01Icon,
  RestaurantIcon,
  Search01Icon,
  SoftDrink01Icon,
  SoftDrink02Icon,
} from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MENU_CATEGORIES, type MenuCategory } from "@/lib/api/types";

export type ViewMode = "grid" | "list";

/** Filter-only concern — kept out of lib/api/types.ts. */
const categoryIcons: Record<MenuCategory, IconSvgElement> = {
  Food: RestaurantIcon,
  Pastries: CroissantIcon,
  Pizza: Pizza01Icon,
  "Signature Cocktail": DrinkIcon,
  "Classic Cocktails": BottleWineIcon,
  Mocktail: GlassWaterIcon,
  Smoothie: SoftDrink01Icon,
  Juices: CupSodaIcon,
  Shots: SoftDrink02Icon,
  Drinks: BeerIcon,
};

type MenuFiltersProps = {
  query: string;
  onQueryChange: (value: string) => void;
  category: MenuCategory | "All";
  onCategoryChange: (value: MenuCategory | "All") => void;
  view: ViewMode;
  onViewChange: (value: ViewMode) => void;
  resultCount: number;
};

export default function MenuFilters({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  view,
  onViewChange,
  resultCount,
}: MenuFiltersProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-boxx-dim"
          />
          <Input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search dishes and drinks..."
            aria-label="Search the menu"
            className={cn("pl-11", query && "pr-11")}
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-boxx-dim transition-colors duration-200 hover:text-boxx-white"
            >
              <HugeiconsIcon icon={Cancel01Icon} aria-hidden className="size-4" />
            </button>
          )}
        </div>

        <div
          role="group"
          aria-label="Menu view"
          className="flex shrink-0 items-center gap-1 self-start rounded-xl border border-boxx-line bg-boxx-coal p-1 sm:self-auto"
        >
          <button
            type="button"
            aria-label="List view"
            aria-pressed={view === "list"}
            onClick={() => onViewChange("list")}
            className={cn(
              "flex size-9 items-center justify-center rounded-lg transition-colors duration-200",
              view === "list"
                ? "bg-boxx-red text-boxx-white"
                : "text-boxx-dim hover:text-boxx-white",
            )}
          >
            <HugeiconsIcon icon={ListViewIcon} aria-hidden className="size-4" />
          </button>
          
          <button
            type="button"
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            onClick={() => onViewChange("grid")}
            className={cn(
              "flex size-9 items-center justify-center rounded-lg transition-colors duration-200",
              view === "grid"
                ? "bg-boxx-red text-boxx-white"
                : "text-boxx-dim hover:text-boxx-white",
            )}
          >
            <HugeiconsIcon icon={GridViewIcon} aria-hidden className="size-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          role="group"
          aria-label="Filter by category"
          className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth pb-1"
        >
          <button
            type="button"
            aria-pressed={category === "All"}
            onClick={() => onCategoryChange("All")}
            className={cn(
              "flex shrink-0 snap-start items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold tracking-wider uppercase transition-colors duration-200",
              category === "All"
                ? "border-boxx-red bg-boxx-red text-boxx-white"
                : "border-boxx-line text-boxx-mist hover:border-boxx-dim hover:text-boxx-white",
            )}
          >
            All
          </button>
          {MENU_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={category === cat}
              onClick={() => onCategoryChange(cat)}
              className={cn(
                "flex shrink-0 snap-start items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold tracking-wider uppercase transition-colors duration-200",
                category === cat
                  ? "border-boxx-red bg-boxx-red text-boxx-white"
                  : "border-boxx-line text-boxx-mist hover:border-boxx-dim hover:text-boxx-white",
              )}
            >
              <HugeiconsIcon icon={categoryIcons[cat]} aria-hidden className="size-3.5" />
              {cat}
            </button>
          ))}
        </div>

        {/* Edge fades hint there's more to scroll — same technique as AtmosphereStrip */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-linear-to-r from-boxx-night to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-boxx-night to-transparent" />
      </div>

      <p className="text-xs tracking-[0.2em] text-boxx-dim uppercase">
        {resultCount} {resultCount === 1 ? "item" : "items"}
      </p>
    </div>
  );
}
