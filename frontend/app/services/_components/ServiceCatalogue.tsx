import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import Container from "@/components/Container";
import SiteImage from "@/components/SiteImage";
import Reveal from "@/components/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { experiences } from "@/lib/experiences";
import { bookingCta } from "@/lib/site";
import { cn } from "@/lib/utils";

export default function ServiceCatalogue() {
  return (
    <section className="py-24 sm:py-32">
      <Container className="space-y-20">
        {experiences.map((exp, i) => (
          <Reveal key={exp.slug}>
            <article className="grid items-center gap-8 md:grid-cols-2 lg:gap-12">
              <SiteImage
                src={exp.image.src}
                alt={exp.image.alt}
                aspect="aspect-video"
                className={cn(i % 2 === 1 && "md:order-last")}
              />
              <div className="flex flex-col items-start">
                <Badge variant="soft">{exp.kind}</Badge>
                <h3 className="mt-4 font-heading text-3xl uppercase tracking-wide text-boxx-white sm:text-4xl">
                  {exp.name}
                </h3>
                <p className="mt-4 leading-relaxed">{exp.summary}</p>
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  {exp.bookable && (
                    <Button asChild>
                      <Link href={bookingCta.href}>{bookingCta.label}</Link>
                    </Button>
                  )}
                  <Link
                    href={exp.href}
                    className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-boxx-mist transition-colors duration-200 hover:text-boxx-red-glow"
                  >
                    Explore {exp.name}
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </Container>
    </section>
  );
}
