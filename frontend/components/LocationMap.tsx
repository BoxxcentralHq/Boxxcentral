import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { contact, site } from "@/lib/site";
import { cn } from "@/lib/utils";

type LocationMapProps = {
  aspect?: string;
  className?: string;
};

const mapQuery = encodeURIComponent(contact.mapQuery);

export default function LocationMap({
  aspect = "aspect-[4/3]",
  className,
}: LocationMapProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-boxx-line bg-boxx-coal",
        aspect,
        className,
      )}
    >
      <iframe
        src={`https://www.google.com/maps?q=${mapQuery}&z=15&output=embed`}
        title={`Map — ${site.name}, ${contact.address}`}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 h-full w-full border-0 invert-[92%] hue-rotate-180 saturate-[35%] contrast-[92%]"
      />

      <a
        href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full border border-boxx-line bg-boxx-night/85 px-4 py-2 text-xs font-bold uppercase tracking-wider text-boxx-white backdrop-blur-sm transition-colors duration-200 hover:border-boxx-red hover:text-boxx-red-glow"
      >
        Get directions
        <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
      </a>
    </div>
  );
}
