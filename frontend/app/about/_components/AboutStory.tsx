import Container from "@/components/Container";
import SiteImage from "@/components/SiteImage";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { site } from "@/lib/site";

const stats = [
  { value: "4", label: "Experiences" },
  { value: "1", label: "Address" },
  { value: "7", label: "Days a week" },
] as const;

export default function AboutStory() {
  return (
    <section className="py-24 sm:py-32">
      <Container className="grid items-start gap-12 md:grid-cols-2 lg:gap-16">
        <Reveal>
          <SectionHeading
            eyebrow="Our story"
            title="Built for the whole evening"
          />
          {/* TODO: replace with the client's real brand story */}
          <div className="mt-8 space-y-5 leading-relaxed">
            <p>
              {site.name} was built on a simple idea: a great night out
              shouldn&apos;t need three addresses. A private film with your
              people, a few frames of bowling, a proper workout, a slow drink
              in good light — all of it lives here.
            </p>
            <p>
              So we put four worlds under one roof in the heart of Osogbo.
              FilmBoxx is a cinema you book for yourself and your crowd.
              GymBoxx is a studio where the work actually gets done. BowlBoxx
              turns an ordinary evening into a rivalry. And the Lounge is
              where every one of those nights lands — warm light, good
              drinks, no rush.
            </p>
            <p>
              Each experience carries its own name and its own character, but
              they share one standard: premium, personal, and made to be
              remembered. Come for one, stay for all four.
            </p>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-boxx-line pt-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dd className="font-heading text-4xl text-boxx-red sm:text-5xl">
                  {stat.value}
                </dd>
                <dt className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-boxx-dim">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal delay={150} className="grid gap-4">
          <SiteImage
            src="/images/about-wide.jpg"
            alt="Cinema hall interior — one of the four experiences"
            aspect="aspect-[4/3]"
          />
          <div className="grid grid-cols-2 gap-4">
            <SiteImage
              src="/images/about-detail-1.jpg"
              alt="Guest enjoying popcorn at the cinema"
              aspect="aspect-square"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <SiteImage
              src="/images/about-detail-2.jpg"
              alt="Drinks being mixed at the lounge bar"
              aspect="aspect-square"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
