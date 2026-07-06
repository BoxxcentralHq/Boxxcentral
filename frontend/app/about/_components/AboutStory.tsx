import Container from "@/components/Container";
import PlaceholderImage from "@/components/PlaceholderImage";
import SectionHeading from "@/components/SectionHeading";
import { site } from "@/lib/site";

export default function AboutStory() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="grid items-start gap-12 md:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow={`About ${site.name}`}
            title="One roof. Four worlds."
            lede={site.description}
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
        </div>
        <div className="grid gap-4">
          <PlaceholderImage label="Facility — wide interior shot" aspect="aspect-[4/3]" />
          <div className="grid grid-cols-2 gap-4">
            <PlaceholderImage label="Detail shot — cinema" aspect="aspect-square" />
            <PlaceholderImage label="Detail shot — lounge" aspect="aspect-square" />
          </div>
        </div>
      </Container>
    </section>
  );
}
