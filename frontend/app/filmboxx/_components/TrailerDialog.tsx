"use client";

import Image from "next/image";
import { Dialog as DialogPrimitive } from "radix-ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Ticket01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogPortal } from "@/components/ui/dialog";
import type { NowShowingMovie } from "@/lib/api/types";
import { cn } from "@/lib/utils";

function youtubeEmbed(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match
    ? `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&rel=0`
    : null;
}

export default function TrailerDialog({
  movie,
  open,
  onOpenChange,
  onBook,
}: {
  movie: NowShowingMovie | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBook: (movie: NowShowingMovie) => void;
}) {
  const url = movie?.trailerUrl;
  const embed = url ? youtubeEmbed(url) : null;
  const meta = movie
    ? [
        movie.genre,
        movie.durationMins !== undefined &&
          `${Math.floor(movie.durationMins / 60)}h ${movie.durationMins % 60}m`,
      ].filter(Boolean)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/95 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.97] data-closed:animate-out data-closed:fade-out-0 sm:p-8"
        >
          {movie?.posterUrl && (
            <div aria-hidden className="pointer-events-none fixed inset-0">
              <Image
                src={movie.posterUrl}
                alt=""
                fill
                sizes="50vw"
                className="scale-110 object-cover opacity-25 blur-3xl"
              />
            </div>
          )}

          {movie && (
            <div className="relative w-full max-w-[min(56rem,calc(60svh*16/9))]">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wider text-boxx-white/60 uppercase">
                    Trailer
                  </p>
                  <DialogPrimitive.Title
                    className={cn(
                      "font-heading mt-1 truncate text-2xl tracking-tight text-boxx-white sm:text-4xl",
                    )}
                  >
                    {movie.title}
                  </DialogPrimitive.Title>
                </div>
                <DialogPrimitive.Close className="flex shrink-0 items-center gap-2 rounded-full border border-boxx-white/20 py-2 pr-4 pl-3 text-sm font-semibold text-boxx-white transition-colors outline-none hover:border-boxx-white hover:bg-boxx-white hover:text-boxx-night focus-visible:ring-2 focus-visible:ring-boxx-white">
                  <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                  Close
                </DialogPrimitive.Close>
              </div>

              <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-[0_40px_120px_-30px_rgb(0_0_0/1)] ring-1 ring-white/10">
                {open &&
                  url &&
                  (embed ? (
                    <iframe
                      src={embed}
                      title={`${movie.title} trailer`}
                      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                      allowFullScreen
                      className="size-full"
                    />
                  ) : (
                    <video
                      src={url}
                      poster={movie.posterUrl}
                      controls
                      autoPlay
                      playsInline
                      className="size-full bg-black object-contain"
                    />
                  ))}
              </div>

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-boxx-mist">
                    {movie.rating && (
                      <span className="rounded border border-boxx-white/40 px-1.5 py-0.5 text-xs font-bold text-boxx-white">
                        {movie.rating}
                      </span>
                    )}
                    {meta.join("  ·  ")}
                  </div>
                  {movie.synopsis && (
                    <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-boxx-dim">
                      {movie.synopsis}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  size="lg"
                  className="shrink-0"
                  onClick={() => onBook(movie)}
                >
                  <HugeiconsIcon
                    icon={Ticket01Icon}
                    aria-hidden
                    className="size-4"
                  />
                  Buy Ticket
                </Button>
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
