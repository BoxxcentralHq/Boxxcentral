import Container from "@/components/Container";
import HighlightList from "@/components/HighlightList";
import PlaceholderImage from "@/components/PlaceholderImage";
import SectionHeading from "@/components/SectionHeading";
import { getExperience } from "@/lib/experiences";

const gymboxx = getExperience("gymboxx");

export default function GymboxxShowcase() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="grid items-start gap-12 md:grid-cols-2">
        <div className="grid gap-4 md:order-first">
          <PlaceholderImage label="GymBoxx — gym floor in action" aspect="aspect-video" />
          <div className="grid grid-cols-2 gap-4">
            <PlaceholderImage label="Equipment detail" aspect="aspect-square" />
            <PlaceholderImage label="Training session" aspect="aspect-square" />
          </div>
        </div>
        <div>
          <SectionHeading
            eyebrow="The studio"
            title="Where the work gets done"
            lede={gymboxx.story}
          />
          <div className="mt-8">
            <HighlightList items={gymboxx.highlights} />
          </div>
        </div>
      </Container>
    </section>
  );
}
