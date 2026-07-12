import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  BowlingPinsIcon,
  DrinkIcon,
  Dumbbell01Icon,
  Film02Icon,
  FilmRoll01Icon,
} from "@hugeicons/core-free-icons";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { experiences } from "@/lib/experiences";

const iconsBySlug: Record<string, typeof FilmRoll01Icon> = {
  filmboxx: Film02Icon,
  gymboxx: Dumbbell01Icon,
  bowlboxx: BowlingPinsIcon,
  lounge: DrinkIcon,
};

/** Compact tour of the four sub-brands — the services page holds the detail. */
export default function AboutWorlds() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="The four worlds"
            title="One roof, four ways in"
            lede="Every experience has its own name, its own room, and its own page — this is the short tour."
          />
        </Reveal>
        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {experiences.map((exp, i) => (
            <Reveal key={exp.slug} delay={i * 100}>
              <Link
                href={exp.href}
                className="group flex h-full flex-col rounded-2xl border border-boxx-line bg-boxx-coal p-7 transition-colors duration-200 hover:border-boxx-red/40 hover:bg-boxx-slate sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <HugeiconsIcon
                    icon={iconsBySlug[exp.slug]}
                    aria-hidden
                    className="size-6 text-boxx-red"
                  />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-boxx-dim">
                    {exp.kind}
                  </span>
                </div>
                <h3 className="mt-6 font-heading text-2xl uppercase tracking-wide text-boxx-white">
                  {exp.name}
                </h3>
                <p className="mt-1 text-sm text-boxx-dim">{exp.tagline}</p>
                <p className="mt-4 text-sm leading-relaxed">{exp.summary}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 pt-2 text-xs font-bold uppercase tracking-wider text-boxx-mist transition-colors duration-200 group-hover:text-boxx-red-glow">
                  Explore {exp.name}
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    aria-hidden
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
