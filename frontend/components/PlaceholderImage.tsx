type PlaceholderImageProps = {
  /** What real asset belongs here — shown faintly and tracked in the asset list. */
  label: string;
  /** Tailwind aspect utility, e.g. "aspect-video", "aspect-[4/5]". */
  aspect?: string;
  className?: string;
};

/**
 * Dark atmospheric stand-in for facility photography we don't have yet.
 * Every instance names the real asset that will replace it, so the design
 * doubles as the client's asset shopping list.
 */
export default function PlaceholderImage({
  label,
  aspect = "aspect-video",
  className = "",
}: PlaceholderImageProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-boxx-line bg-gradient-to-br from-boxx-slate via-boxx-coal to-boxx-night ${aspect} ${className}`}
    >
      {/* Soft red glow to keep placeholders on-brand and atmospheric */}
      <div className="absolute -bottom-1/3 -right-1/4 h-2/3 w-2/3 rounded-full bg-boxx-red opacity-[0.07] blur-3xl" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <span className="text-center text-xs uppercase tracking-[0.2em] text-boxx-dim">
          {label}
        </span>
      </div>
    </div>
  );
}
