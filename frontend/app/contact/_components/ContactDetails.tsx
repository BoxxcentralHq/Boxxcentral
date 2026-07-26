import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import SiteImage from "@/components/SiteImage";
import { contact, socials } from "@/lib/site";

const linkClass = "text-boxx-white transition-colors duration-200 hover:text-boxx-red-glow";

/** Small label / value pair — matches the dt/dd rhythm AboutStory uses for its stats. */
function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-boxx-dim">{label}</p>
      <div className="mt-2 text-[15px] leading-relaxed">{children}</div>
    </div>
  );
}

export default function ContactDetails() {
  return (
    <div className="flex h-full flex-col">
      <SiteImage
        src="/images/lounge-detail-2.jpg"
        alt="Barman preparing drinks at the BoxxCentral bar"
        aspect="aspect-[4/3]"
      />

      <div className="mt-8 space-y-6 divide-y divide-boxx-line">
        <Detail label="Address">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.mapQuery)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-start gap-1.5 ${linkClass}`}
          >
            {contact.address}
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              aria-hidden
              className="mt-1 size-3.5 shrink-0 text-boxx-dim"
            />
          </a>
        </Detail>

        <div className="pt-6">
          <Detail label="Opening hours">
            <ul className="space-y-1.5">
              {contact.hours.map((h) => (
                <li key={h.days} className="flex justify-between gap-4">
                  <span className="text-boxx-white">{h.days}</span>
                  <span>{h.time}</span>
                </li>
              ))}
            </ul>
          </Detail>
        </div>

        <div className="pt-6">
          <Detail label="Reach us">
            <div className="flex flex-col gap-1">
              <a href={`tel:${contact.phone}`} className={linkClass}>
                {contact.phone}
              </a>
              <a href={`mailto:${contact.email}`} className={linkClass}>
                {contact.email}
              </a>
            </div>
          </Detail>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="flex size-10 items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-white"
          >
            <HugeiconsIcon icon={s.icon} aria-hidden className="size-4" />
          </a>
        ))}
      </div>
    </div>
  );
}
