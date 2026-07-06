import Link from "next/link";
import Button from "@/components/Button";
import Container from "@/components/Container";
import PlaceholderImage from "@/components/PlaceholderImage";
import SectionHeading from "@/components/SectionHeading";
import { experiences } from "@/lib/experiences";
import { bookingCta } from "@/lib/site";

export default function ServiceCatalogue() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Services"
          title="What's inside BoxxCentral"
          lede="Every experience in the building, at a glance — tap any of them to go deeper."
        />

        <div className="mt-14 space-y-16">
          {experiences.map((exp, i) => (
            <article
              key={exp.slug}
              className="grid items-center gap-8 md:grid-cols-2"
            >
              <PlaceholderImage
                label={`${exp.name} — feature photo`}
                aspect="aspect-video"
                className={i % 2 === 1 ? "md:order-last" : ""}
              />
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-boxx-red">
                  {exp.kind}
                </span>
                <h3 className="mt-3 text-2xl font-bold text-boxx-white sm:text-3xl">
                  {exp.name}
                </h3>
                <p className="mt-4 leading-relaxed">{exp.summary}</p>
                <div className="mt-6 flex items-center gap-5">
                  <Link
                    href={exp.href}
                    className="text-sm font-semibold text-boxx-red-glow transition-colors hover:text-boxx-red"
                  >
                    Explore {exp.name} →
                  </Link>
                  {exp.bookable && <Button href={bookingCta.href}>{bookingCta.label}</Button>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
