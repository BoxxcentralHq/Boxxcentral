import Container from "@/components/Container";
import PlaceholderImage from "@/components/PlaceholderImage";
import SectionHeading from "@/components/SectionHeading";

/** Photo band selling the atmosphere — six slots awaiting real facility shots. */
const gallerySlots = [
  "Cinema room — lights down",
  "Bowling lanes at night",
  "Lounge interior — warm light",
  "Gym floor in action",
  "Guests — group night out",
  "Exterior / entrance signage",
];

export default function AtmosphereStrip() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="The atmosphere"
          title="See it before you feel it"
          lede="A look inside the space — every corner built for a good night."
        />
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
          {gallerySlots.map((label) => (
            <PlaceholderImage key={label} label={label} aspect="aspect-square" />
          ))}
        </div>
      </Container>
    </section>
  );
}
