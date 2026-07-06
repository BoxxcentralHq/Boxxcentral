import Container from "@/components/Container";
import HighlightList from "@/components/HighlightList";
import PlaceholderImage from "@/components/PlaceholderImage";
import SectionHeading from "@/components/SectionHeading";
import { getExperience } from "@/lib/experiences";

const filmboxx = getExperience("filmboxx");

export default function FilmboxxShowcase() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="grid items-start gap-12 md:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="The experience"
            title="Your screen. Your people."
            lede={filmboxx.story}
          />
          <div className="mt-8">
            <HighlightList items={filmboxx.highlights} />
          </div>
        </div>
        <div className="grid gap-4">
          <PlaceholderImage label="FilmBoxx — screening room, lights down" aspect="aspect-video" />
          <div className="grid grid-cols-2 gap-4">
            <PlaceholderImage label="Seating detail" aspect="aspect-square" />
            <PlaceholderImage label="Screen / projection" aspect="aspect-square" />
          </div>
        </div>
      </Container>
    </section>
  );
}
