type SectionHeadingProps = {
  /** Small red label above the title. */
  eyebrow?: string;
  title: string;
  lede?: string;
  align?: "left" | "center";
};

/** Consistent section header: red eyebrow, white title, muted lede. */
export default function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <div className={`flex flex-col gap-3 ${alignment}`}>
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-boxx-red">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-boxx-white sm:text-4xl">
        {title}
      </h2>
      {lede && <p className="max-w-2xl text-base leading-relaxed">{lede}</p>}
    </div>
  );
}
