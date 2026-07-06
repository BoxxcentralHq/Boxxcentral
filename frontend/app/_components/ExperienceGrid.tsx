import Link from "next/link";
import Container from "@/components/Container";
import PlaceholderImage from "@/components/PlaceholderImage";
import SectionHeading from "@/components/SectionHeading";
import { experiences } from "@/lib/experiences";

export default function ExperienceGrid() {
  const [filmboxx, ...rest] = experiences;

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="The experiences"
          title="Everything under one roof"
          lede="Four worlds inside one address — pick where the evening starts."
        />

        <div className="mt-12 grid gap-6">
          {/* FilmBoxx — the headline experience, full width */}
          <Link
            href={filmboxx.href}
            className="group relative overflow-hidden rounded-2xl border border-boxx-line bg-boxx-coal transition-colors hover:border-boxx-red"
          >
            <div className="grid md:grid-cols-2">
              <PlaceholderImage
                label={`${filmboxx.name} — cinema room photo`}
                aspect="aspect-video md:aspect-auto md:min-h-72"
                className="rounded-none border-0"
              />
              <div className="flex flex-col justify-center gap-4 p-8 sm:p-10">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-boxx-red">
                  {filmboxx.kind}
                </span>
                <h3 className="text-3xl font-bold text-boxx-white">{filmboxx.name}</h3>
                <p className="leading-relaxed">{filmboxx.summary}</p>
                <span className="text-sm font-semibold text-boxx-red-glow">
                  Book a private session →
                </span>
              </div>
            </div>
          </Link>

          {/* The other three experiences */}
          <div className="grid gap-6 md:grid-cols-3">
            {rest.map((exp) => (
              <Link
                key={exp.slug}
                href={exp.href}
                className="group flex flex-col overflow-hidden rounded-2xl border border-boxx-line bg-boxx-coal transition-colors hover:border-boxx-red"
              >
                <PlaceholderImage
                  label={`${exp.name} photo`}
                  aspect="aspect-[4/3]"
                  className="rounded-none border-0"
                />
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-boxx-dim">
                    {exp.kind}
                  </span>
                  <h3 className="text-xl font-bold text-boxx-white">{exp.name}</h3>
                  <p className="text-sm leading-relaxed">{exp.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
