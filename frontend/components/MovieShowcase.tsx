import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon } from "@hugeicons/core-free-icons";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import SiteImage from "@/components/SiteImage";
import { Badge } from "@/components/ui/badge";
import type { Movie } from "@/lib/api/types";

/**
 * FilmBoxx's "now showing" grid — fed by GET /cinema/movies (visible only).
 * A down or empty catalog just omits the section; guests can still bring
 * their own film, so there's nothing broken about having none listed.
 */
export default function MovieShowcase({ movies }: { movies: Movie[] | null }) {
  if (!movies || movies.length === 0) return null;

  return (
    <section className="border-t border-boxx-line py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Now showing"
            title="Pick your film"
            lede="Bring your own drive, or choose from what's currently lined up — either way, the room is yours."
          />
        </Reveal>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {movies.map((movie, i) => (
            <Reveal key={movie._id} delay={i * 80}>
              <SiteImage
                src={movie.posterUrl}
                alt={movie.title}
                aspect="aspect-2/3"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="mt-4">
                <h3 className="font-heading text-lg uppercase tracking-wide text-boxx-white">
                  {movie.title}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-boxx-dim">
                  {movie.genre && (
                    <Badge variant="outline" className="text-[10px]">
                      {movie.genre}
                    </Badge>
                  )}
                  {movie.durationMins !== undefined && (
                    <span className="flex items-center gap-1">
                      <HugeiconsIcon icon={Clock01Icon} aria-hidden className="size-3.5" />
                      {movie.durationMins} min
                    </span>
                  )}
                </div>
                {movie.synopsis && (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed">
                    {movie.synopsis}
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
