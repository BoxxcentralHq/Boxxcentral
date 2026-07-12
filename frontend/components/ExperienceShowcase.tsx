import Link from "next/link";
import Container from "@/components/Container";
import HighlightList from "@/components/HighlightList";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import SiteImage from "@/components/SiteImage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Experience } from "@/lib/experiences";

/**
 * Story + media section shared by every sub-brand page. Copy, media, and
 * column order all come from the experience's `showcase` data.
 */
export default function ExperienceShowcase({ experience }: { experience: Experience }) {
  const { showcase } = experience;
  const [wide, detailA, detailB] = showcase.media;

  return (
    <section className="py-24 sm:py-32">
      <Container className="grid items-start gap-12 md:grid-cols-2 lg:gap-16">
        <Reveal>
          <SectionHeading
            eyebrow={showcase.eyebrow}
            title={showcase.title}
            lede={experience.story}
          />
          <div className="mt-10">
            <HighlightList items={experience.highlights} />
          </div>
          {/* Books this experience — pre-selected on /book via the param */}
          <Button asChild size="lg" className="mt-10">
            <Link href={`/book?experience=${experience.slug}`}>
              Book {experience.name}
            </Link>
          </Button>
        </Reveal>

        <Reveal
          delay={150}
          className={cn("grid gap-4", showcase.mediaFirst && "md:order-first")}
        >
          <SiteImage src={wide.src} alt={wide.alt} aspect="aspect-video" />
          <div className="grid grid-cols-2 gap-4">
            <SiteImage src={detailA.src} alt={detailA.alt} aspect="aspect-square" sizes="(max-width: 768px) 50vw, 25vw" />
            <SiteImage src={detailB.src} alt={detailB.alt} aspect="aspect-square" sizes="(max-width: 768px) 50vw, 25vw" />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
