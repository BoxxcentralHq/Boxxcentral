import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import SiteImage from "@/components/SiteImage";
import { cn } from "@/lib/utils";

const gallery = [
  {
    src: "/images/gallery-1.jpg",
    alt: "Audience in the cinema, lights down",
    aspect: "aspect-[4/3]",
  },
  {
    src: "/images/gallery-2.jpg",
    alt: "Bowling alley lanes at night",
    aspect: "aspect-[3/4]",
  },
  {
    src: "/images/gallery-3.jpg",
    alt: "Guest with a cocktail in the lounge",
    aspect: "aspect-[16/9]",
  },
  {
    src: "/images/gallery-4.jpg",
    alt: "Treadmills on the gym floor",
    aspect: "aspect-square",
  },
  {
    src: "/images/gallery-5.jpg",
    alt: "Friends sharing popcorn at the movies",
    aspect: "aspect-[3/4]",
  },
  {
    src: "/images/gallery-6.jpg",
    alt: "Backlit bar shelf with spirits",
    aspect: "aspect-[16/9]",
  },
];

function FilmstripFrames({ decorative = false }: { decorative?: boolean }) {
  return (
    <div className="flex gap-4 pr-4" aria-hidden={decorative || undefined}>
      {gallery.map((shot) => (
        <figure key={shot.src} className="group relative shrink-0">
          <SiteImage
            src={shot.src}
            alt={shot.alt}
            aspect={cn(shot.aspect, "h-64 sm:h-80")}
            sizes="(max-width: 640px) 70vw, 40vw"
          />
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-2xl bg-linear-to-t from-boxx-night/90 to-transparent p-4 pt-12 text-xs uppercase tracking-[0.2em] text-boxx-mist opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {shot.alt}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export default function AtmosphereStrip() {
  return (
    <section className="overflow-hidden py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="The atmosphere"
            title="See it before you feel it"
            lede="A look inside the space — every corner built for a good night."
            stroke
          />
        </Reveal>
      </Container>

      {/* Full-bleed filmstrip: drifts sideways, pauses on hover */}
      <Reveal>
        <div className="marquee relative mt-12 overflow-hidden">
          <div className="marquee-track flex w-max">
            <FilmstripFrames />
            <FilmstripFrames decorative />
          </div>

          {/* Edge fades so frames emerge from and dissolve into the canvas */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-linear-to-r from-boxx-night to-transparent sm:w-28" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-linear-to-l from-boxx-night to-transparent sm:w-28" />
        </div>
      </Reveal>
    </section>
  );
}
