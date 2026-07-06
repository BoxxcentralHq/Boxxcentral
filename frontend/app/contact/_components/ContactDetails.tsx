import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Call02Icon,
  Clock01Icon,
  Location01Icon,
  Mail01Icon,
  Share01Icon,
} from "@hugeicons/core-free-icons";
import { contact, socials } from "@/lib/site";

/** Raised card wrapping one contact group. */
function DetailCard({
  icon,
  label,
  children,
}: {
  icon: IconSvgElement;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-boxx-line bg-boxx-coal p-6">
      <p className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.2em] text-boxx-dim">
        <span className="flex size-9 items-center justify-center rounded-full border border-boxx-line">
          <HugeiconsIcon
            icon={icon}
            aria-hidden
            className="size-4 text-boxx-red"
          />
        </span>
        {label}
      </p>
      <div className="mt-4 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

const detailLinkClass = "transition-colors duration-200 hover:text-boxx-white";

export default function ContactDetails() {
  return (
    <div className="space-y-5">
      <DetailCard icon={Location01Icon} label="Visit us">
        <p className="text-boxx-white">{contact.address}</p>
      </DetailCard>

      <DetailCard icon={Clock01Icon} label="Opening hours">
        <ul className="space-y-1.5">
          {contact.hours.map((h) => (
            <li key={h.days} className="flex justify-between gap-4">
              <span className="text-boxx-white">{h.days}</span>
              <span>{h.time}</span>
            </li>
          ))}
        </ul>
      </DetailCard>

      <DetailCard icon={Call02Icon} label="Talk to us">
        <ul className="space-y-1.5">
          <li>
            <a href={`tel:${contact.phone}`} className={detailLinkClass}>
              {contact.phone}
            </a>
          </li>
          <li>
            <a
              href={`mailto:${contact.email}`}
              className={`inline-flex items-center gap-2 ${detailLinkClass}`}
            >
              <HugeiconsIcon
                icon={Mail01Icon}
                aria-hidden
                className="size-4 text-boxx-dim"
              />
              {contact.email}
            </a>
          </li>
        </ul>
      </DetailCard>

      <DetailCard icon={Share01Icon} label="Follow us">
        <div className="flex gap-3">
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
      </DetailCard>
    </div>
  );
}
