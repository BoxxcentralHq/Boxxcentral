import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";

/** Icon + title + description block for a list, grid, or table with nothing to show. */
export default function EmptyState({
  icon,
  title,
  description,
}: {
  icon: IconSvgElement;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full border border-boxx-line text-boxx-dim">
        <HugeiconsIcon icon={icon} aria-hidden className="size-5" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-boxx-white">{title}</p>
        {description && <p className="text-xs text-boxx-dim">{description}</p>}
      </div>
    </div>
  );
}
