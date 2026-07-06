type HighlightListProps = {
  items: readonly string[];
};

/** Red-tick feature list used across the sub-brand pages. */
export default function HighlightList({ items }: HighlightListProps) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
          <span aria-hidden className="mt-0.5 font-bold text-boxx-red">
            ✦
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
