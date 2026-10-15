import Image from "next/image";
import { cn } from "@/lib/utils";

type SiteImageProps = {
  src?: string;
  alt: string;
  aspect?: string;
  className?: string;
  sizes?: string;
};

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
