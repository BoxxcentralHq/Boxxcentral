import Container from "@/components/Container";
import HighlightList from "@/components/HighlightList";
import PlaceholderImage from "@/components/PlaceholderImage";
import SectionHeading from "@/components/SectionHeading";
import { getExperience } from "@/lib/experiences";

const bowlboxx = getExperience("bowlboxx");

export default function BowlboxxShowcase() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="grid items-start gap-12 md:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="The lanes"
            title="Loud nights, clean strikes"
            lede={bowlboxx.story}
          />
          <div className="mt-8">
            <HighlightList items={bowlboxx.highlights} />
          </div>
        </div>
        <div className="grid gap-4">
          <PlaceholderImage label="BowlBoxx — lanes at night" aspect="aspect-video" />
          <div className="grid grid-cols-2 gap-4">
            <PlaceholderImage label="Pins / lane detail" aspect="aspect-square" />
            <PlaceholderImage label="Friends mid-game" aspect="aspect-square" />
          </div>
        </div>
      </Container>
    </section>
  );
}
