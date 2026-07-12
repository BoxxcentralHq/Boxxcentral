import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

type HighlightListProps = {
  items: readonly string[];
};

/** Red-tick feature list used across the sub-brand pages. */
export default function HighlightList({ items }: HighlightListProps) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
          <HugeiconsIcon
            icon={Tick02Icon}
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-boxx-red"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}
