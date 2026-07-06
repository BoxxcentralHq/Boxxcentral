import Container from "@/components/Container";
import SiteImage from "@/components/SiteImage";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { site } from "@/lib/site";

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
              Every experience carries its own name and its own character —
              FilmBoxx, GymBoxx, BowlBoxx, and the Lounge — but they share one
              standard: premium, personal, and made to be remembered.
            </p>
          </div>
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
