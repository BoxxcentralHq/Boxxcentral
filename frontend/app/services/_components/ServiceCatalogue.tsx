import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import Container from "@/components/Container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { experiences } from "@/lib/experiences";
import { bookingCta } from "@/lib/site";

/**
 * Sticky offsets per card: each panel pins slightly lower than the one
 * before, so earlier chapters peek out above as the next slides over.
 * (Static classes — Tailwind can't see computed class names.)
 */
const stickyTops = ["top-24", "top-28", "top-32", "top-36"];

/**
 * The four experiences as full-image "chapters" that stack over one
 * another on scroll. No <Reveal> here: a sticky element can only pin
 * within its parent's bounds, so the cards must sit directly in the
 * scrolling flow — the stacking itself is the animation.
 */
export default function ServiceCatalogue() {
  return (
    <section className="py-24 sm:py-32">
      <Container className="space-y-6">
        {experiences.map((exp, i) => (
          <article
            key={exp.slug}
            className={`sticky ${stickyTops[i % stickyTops.length]} overflow-hidden rounded-2xl border border-boxx-line bg-boxx-coal`}
          >
            <Image
              src={exp.image.src}
              alt={exp.image.alt}
              fill
              sizes="(max-width: 1152px) 100vw, 1152px"
              quality={100}
              className="object-cover"
            />
            {/* Scrim: readable copy at the bottom, image breathing on top */}
            <div className="absolute inset-0 bg-linear-to-t from-boxx-night via-boxx-night/45 to-boxx-night/10" />

            {/* Chapter number, outlined so it stays quiet */}
            <span
              aria-hidden
              className="absolute right-6 top-5 font-heading text-7xl leading-none text-stroke sm:right-10 sm:text-8xl"
            >
              0{i + 1}
            </span>

            <div className="relative flex min-h-[72vh] flex-col items-start justify-end p-6 sm:p-10 lg:p-14">
              <Badge variant="soft">{exp.kind}</Badge>
              <h3 className="mt-4 font-heading text-4xl uppercase tracking-wide text-boxx-white sm:text-6xl">
                {exp.name}
              </h3>
              <p className="mt-4 max-w-xl leading-relaxed text-boxx-mist">
                {exp.summary}
              </p>

              {/* A taste of the highlights as quiet glass chips */}
              <ul className="mt-6 hidden flex-wrap gap-2 sm:flex">
                {exp.highlights.slice(0, 3).map((h) => (
                  <li
                    key={h}
                    className="rounded-full border border-boxx-white/15 bg-boxx-night/50 px-3.5 py-1.5 text-xs text-boxx-mist backdrop-blur-sm"
                  >
                    {h}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                {/* Pre-selects this experience on the booking form via the query param */}
                <Button asChild>
                  <Link href={`${bookingCta.href}?experience=${exp.slug}`}>
                    Book {exp.name}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={exp.href}>
                    Explore {exp.name}
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="size-4"
                    />
                  </Link>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </Container>
    </section>
  );
}
