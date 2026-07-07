import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  Location01Icon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import Container from "@/components/Container";
import LocationMap from "@/components/LocationMap";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { contact } from "@/lib/site";

export default function VisitUs() {
  return (
    <section className="border-t border-boxx-line bg-boxx-coal py-24 sm:py-32">
      <Container className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
        <Reveal>
          <SectionHeading
            eyebrow="Visit us"
            title="Come see it for yourself"
            lede="Walk in for the lounge, book ahead for the cinema — either way, we're easy to find."
          />

          <div className="mt-8 flex items-start gap-2.5 text-sm text-boxx-white">
            <HugeiconsIcon
              icon={Location01Icon}
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-boxx-red"
            />
            {contact.address}
          </div>

          <ul className="mt-5 max-w-sm space-y-2 text-sm">
            {contact.hours.map((h) => (
              <li key={h.days} className="flex items-center gap-2.5">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  aria-hidden
                  className="size-4 shrink-0 text-boxx-dim"
                />
                <span className="text-boxx-white">{h.days}</span>
                <span className="ml-auto text-boxx-mist">{h.time}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button asChild variant="outline">
              <Link href="/contact">Contact details</Link>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <LocationMap aspect="aspect-[4/3]" />
        </Reveal>
      </Container>
    </section>
  );
}
