"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import Reveal from "@/components/Reveal";
import SiteImage from "@/components/SiteImage";
import { Badge } from "@/components/ui/badge";
import type { MenuItem } from "@/lib/menu";
import type { ViewMode } from "./MenuFilters";

/** Caps the stagger so long lists don't push the last card's entrance out for ages. */
const staggerDelay = (i: number) => Math.min(i, 8) * 60;

type MenuGridProps = {
  items: MenuItem[];
  view: ViewMode;
  onSelect: (item: MenuItem) => void;
};

export default function MenuGrid({ items, view, onSelect }: MenuGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-boxx-line py-20 text-center">
        <p className="text-sm text-boxx-dim">
          Nothing matches that search — try another dish or drink.
        </p>
      </div>
    );
  }

  if (view === "list") {
    return (
      <ul className="divide-y divide-boxx-line overflow-hidden rounded-2xl border border-boxx-line bg-boxx-coal">
        {items.map((item, i) => (
          <li key={item.id}>
            <Reveal delay={staggerDelay(i)}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="group flex w-full items-center gap-4 p-4 text-left transition-colors duration-200 hover:bg-boxx-slate sm:p-5"
              >
                <SiteImage
                  alt={item.image.alt}
                  aspect="aspect-square"
                  className="size-16 shrink-0 sm:size-20"
                  sizes="80px"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-heading text-base tracking-wide text-boxx-white uppercase sm:text-lg">
                      {item.name}
                    </h3>
                    {item.tags?.includes("Popular") && (
                      <Badge variant="soft" className="hidden shrink-0 sm:inline-flex">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-boxx-dim">
                    {item.description}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-heading text-base text-boxx-red-glow sm:text-lg">
                    {item.price}
                  </span>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    aria-hidden
                    className="size-4 text-boxx-dim transition-transform duration-200 group-hover:translate-x-1 group-hover:text-boxx-white"
                  />
                </div>
              </button>
            </Reveal>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <Reveal key={item.id} delay={staggerDelay(i)}>
          <button
            type="button"
            onClick={() => onSelect(item)}
            className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-boxx-line bg-boxx-coal text-left transition-colors duration-200 hover:border-boxx-red/40 hover:bg-boxx-slate"
          >
            <div className="relative">
              <SiteImage
                alt={item.image.alt}
                aspect="aspect-[4/3]"
                className="rounded-none border-0"
              />
              {item.tags?.includes("Popular") && (
                <Badge variant="default" className="absolute top-3 left-3">
                  Popular
                </Badge>
              )}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-heading text-lg tracking-wide text-boxx-white uppercase">
                  {item.name}
                </h3>
                <span className="shrink-0 font-heading text-lg text-boxx-red-glow">
                  {item.price}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-boxx-dim">
                {item.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-boxx-mist uppercase transition-colors duration-200 group-hover:text-boxx-red-glow">
                View details
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  aria-hidden
                  className="size-3.5 transition-transform duration-200 group-hover:translate-x-1"
                />
              </span>
            </div>
          </button>
        </Reveal>
      ))}
    </div>
  );
}
