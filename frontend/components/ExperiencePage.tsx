import Link from "next/link";
import BookingSection from "@/components/BookingSection";
import ExperienceShowcase from "@/components/ExperienceShowcase";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import type { Experience } from "@/lib/experiences";

/**
 * Complete sub-brand page (hero + showcase [+ children] [+ booking]), driven
 * entirely by the experience's data in lib/experiences.ts. Bookable
 * experiences get a primary "Book {name}" CTA that jumps to the embedded
 * booking form, plus the data-driven secondary CTA; non-bookable experiences
 * show just the secondary CTA on its own. `children` is an optional slot
 * between the showcase and the booking form — FilmBoxx uses it for the
 * movie catalog.
 */
export default function ExperiencePage({
  experience,
  children,
}: {
  experience: Experience;
  children?: React.ReactNode;
}) {
  return (
    <>
      <PageHero
        eyebrow={experience.kind}
        title={experience.name}
        description={experience.tagline}
        videoSrc={experience.hero.videoSrc}
        note={experience.hero.note}
        actions={
          experience.bookable ? (
            <>
              <Button asChild size="lg">
                <Link href="#book">Book {experience.name}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={experience.hero.cta.href}>
                  {experience.hero.cta.label}
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild variant="outline" size="lg">
              <Link href={experience.hero.cta.href}>
                {experience.hero.cta.label}
              </Link>
            </Button>
          )
        }
      />
      <ExperienceShowcase experience={experience} />
      {children}
      {experience.bookable && <BookingSection experience={experience} />}
    </>
  );
}
