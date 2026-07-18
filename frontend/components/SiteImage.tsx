import Image from "next/image";
import { cn } from "@/lib/utils";

type SiteImageProps = {
  /** Image under /public. Omit to render the branded placeholder slot. */
  src?: string;
  /** Alt text — doubles as the placeholder label while no src exists. */
  alt: string;
  /** Tailwind aspect utility, e.g. "aspect-video", "aspect-[4/5]". */
  aspect?: string;
  className?: string;
  /** next/image responsive sizes hint. */
  sizes?: string;
};

/**
 * The one image frame used across the site: rounded, hairline border,
 * cover-fit photo. Without a `src` it degrades to an on-brand dark
 * placeholder naming the asset that belongs there, so unsourced slots
 * double as the client's asset shopping list.
 */
export default function SiteImage({
  src,
  alt,
  aspect = "aspect-video",
  className,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: SiteImageProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-boxx-line bg-linear-to-br from-boxx-slate via-boxx-coal to-boxx-night",
        aspect,
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={100}
          className="object-cover"
        />
      ) : (
        <>
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <span className="text-center text-xs uppercase tracking-[0.2em] text-boxx-dim">
              {alt}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
