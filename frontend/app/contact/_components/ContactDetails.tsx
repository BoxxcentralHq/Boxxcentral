import Button from "@/components/Button";
import Container from "@/components/Container";
import PlaceholderImage from "@/components/PlaceholderImage";
import SectionHeading from "@/components/SectionHeading";
import { contact, socials } from "@/lib/site";

export default function ContactDetails() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="grid items-start gap-12 md:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Contact"
            title="Find us. Reach us."
            lede="Questions, group bookings, events — talk to us on WhatsApp or drop by."
          />

          <dl className="mt-10 space-y-6 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-boxx-dim">
                Address
              </dt>
              <dd className="mt-2 text-boxx-white">{contact.address}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-boxx-dim">
                Phone / Email
              </dt>
              <dd className="mt-2 space-y-1">
                <p>
                  <a href={`tel:${contact.phone}`} className="transition-colors hover:text-boxx-white">
                    {contact.phone}
                  </a>
                </p>
                <p>
                  <a href={`mailto:${contact.email}`} className="transition-colors hover:text-boxx-white">
                    {contact.email}
                  </a>
                </p>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-boxx-dim">
                Opening hours
              </dt>
              <dd className="mt-2 space-y-1">
                {contact.hours.map((h) => (
                  <p key={h.days}>
                    <span className="text-boxx-white">{h.days}:</span> {h.time}
                  </p>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-boxx-dim">
                Socials
              </dt>
              <dd className="mt-2 flex gap-4">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-boxx-white"
                  >
                    {s.label}
                  </a>
                ))}
              </dd>
            </div>
          </dl>

          <div className="mt-10">
            <Button href={contact.whatsapp}>Chat on WhatsApp</Button>
          </div>
        </div>

        <PlaceholderImage label="Google Maps embed — facility location" aspect="aspect-[4/5]" />
      </Container>
    </section>
  );
}
