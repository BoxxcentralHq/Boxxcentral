import Container from "@/components/Container";
import HighlightList from "@/components/HighlightList";
import PlaceholderImage from "@/components/PlaceholderImage";
import SectionHeading from "@/components/SectionHeading";
import { getExperience } from "@/lib/experiences";

const lounge = getExperience("lounge");

export default function LoungeShowcase() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="grid items-start gap-12 md:grid-cols-2">
        <div className="grid gap-4 md:order-first">
          <PlaceholderImage label="Lounge — interior, warm light" aspect="aspect-video" />
          <div className="grid grid-cols-2 gap-4">
            <PlaceholderImage label="Drinks / menu detail" aspect="aspect-square" />
            <PlaceholderImage label="Seating corner" aspect="aspect-square" />
          </div>
        </div>
        <div>
          <SectionHeading
            eyebrow="The room"
            title="The soft landing"
            lede={lounge.story}
          />
          <div className="mt-8">
            <HighlightList items={lounge.highlights} />
          </div>
        </div>
      </Container>
    </section>
  );
}
