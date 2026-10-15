import Link from "next/link";
import ExperienceShowcase from "@/components/ExperienceShowcase";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import type { Experience } from "@/lib/experiences";

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
                <Link href={`${experience.href}#now-showing`}>Buy tickets</Link>
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
    </>
  );
}
