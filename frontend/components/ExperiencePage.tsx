import Link from "next/link";
import ExperienceShowcase from "@/components/ExperienceShowcase";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import type { Experience } from "@/lib/experiences";

/**
 * Complete sub-brand page (hero + showcase), driven entirely by the
 * experience's data in lib/experiences.ts. The hero carries the data CTA;
 * the showcase below adds the "Book {name}" action after the highlights.
 */
export default function ExperiencePage({ experience }: { experience: Experience }) {
  return (
    <>
      <PageHero
        eyebrow={experience.kind}
        title={experience.name}
        description={experience.tagline}
        videoSrc={experience.hero.videoSrc}
        note={experience.hero.note}
        actions={
          <Button asChild variant={experience.bookable ? "default" : "outline"} size="lg">
            <Link href={experience.hero.cta.href}>{experience.hero.cta.label}</Link>
          </Button>
        }
      />
      <ExperienceShowcase experience={experience} />
    </>
  );
}
