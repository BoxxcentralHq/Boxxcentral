import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import Container from "@/components/Container";
import SiteImage from "@/components/SiteImage";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { experiences } from "@/lib/experiences";

export default function ExperienceGrid() {
  const [filmboxx, ...rest] = experiences;

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="The experiences"
            title="Everything under one roof"
            lede="Four worlds inside one address — pick where the evening starts."
          />
        </Reveal>

        <div className="mt-12 grid gap-6">
          {/* FilmBoxx — the headline experience, full width */}
          <Reveal>
            <Link
              href={filmboxx.href}
              className="group block overflow-hidden rounded-2xl border border-boxx-line bg-boxx-coal transition-colors duration-300 hover:border-boxx-red"
            >
              <div className="grid md:grid-cols-2">
                <div className="overflow-hidden">
                  <SiteImage
                    src={filmboxx.image.src}
                    alt={filmboxx.image.alt}
                    aspect="aspect-video md:aspect-auto md:min-h-72 md:h-full"
                    className="rounded-none border-0 transition-transform duration-500 ease-(--ease-standard) group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-col items-start justify-center gap-4 p-8 sm:p-10">
                  <Badge variant="soft">{filmboxx.kind}</Badge>
                  <h3 className="font-heading text-3xl uppercase tracking-wide text-boxx-white sm:text-4xl">
                    {filmboxx.name}
                  </h3>
                  <p className="leading-relaxed">{filmboxx.summary}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-boxx-red-glow">
                    Book a private session
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {rest.map((exp, i) => (
              <Reveal key={exp.slug} delay={i * 120}>
                <Link
                  href={exp.href}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-boxx-line bg-boxx-coal transition-colors duration-300 hover:border-boxx-red"
                >
                  <div className="overflow-hidden">
                    <SiteImage
                      src={exp.image.src}
                      alt={exp.image.alt}
                      aspect="aspect-[4/3]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="rounded-none border-0 transition-transform duration-500 ease-(--ease-standard) group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col items-start gap-3 p-6">
                    <Badge variant="outline">{exp.kind}</Badge>
                    <h3 className="font-heading text-2xl uppercase tracking-wide text-boxx-white">
                      {exp.name}
                    </h3>
                    <p className="text-sm leading-relaxed">{exp.tagline}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
