import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  lede?: string;
  align?: "left" | "center";
  stroke?: boolean;
};

export default function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  stroke = false,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left"
      )}
    >
      {eyebrow && (
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-boxx-red">
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "font-heading text-4xl leading-tight tracking-tight sm:text-5xl",
          stroke ? "text-stroke-white" : "text-boxx-white",
        )}
      >
        {title}
      </h2>
      {lede && (
        <p className="max-w-2xl text-base leading-relaxed text-boxx-mist">{lede}</p>
      )}
    </div>
  );
}
