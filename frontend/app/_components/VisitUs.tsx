import Button from "@/components/Button";
import Container from "@/components/Container";
import PlaceholderImage from "@/components/PlaceholderImage";
import SectionHeading from "@/components/SectionHeading";
import { contact } from "@/lib/site";

export default function VisitUs() {
  return (
    <section className="border-t border-boxx-line bg-boxx-coal py-20 sm:py-24">
      <Container className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Visit us"
            title="Come see it for yourself"
            lede="Walk in for the lounge, book ahead for the cinema — either way, we're easy to find."
          />
          <ul className="mt-8 space-y-3 text-sm">
            <li className="text-boxx-white">{contact.address}</li>
            {contact.hours.map((h) => (
              <li key={h.days}>
                <span className="text-boxx-white">{h.days}:</span> {h.time}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button href={contact.whatsapp}>Chat on WhatsApp</Button>
            <Button href="/contact" variant="ghost">
              Contact details
            </Button>
          </div>
        </div>
        <PlaceholderImage label="Map embed / location photo" aspect="aspect-[4/3]" />
      </Container>
    </section>
  );
}
