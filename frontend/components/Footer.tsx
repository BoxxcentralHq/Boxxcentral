import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Call02Icon,
  Location01Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { experiences } from "@/lib/experiences";
import { bookingCta, contact, navLinks, site, socials } from "@/lib/site";
import Image from "next/image";

/** Uppercase micro-label used for footer column titles. */
function ColumnLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-boxx-dim">
      {children}
    </p>
  );
}

const footerLinkClass =
  "text-sm text-boxx-mist transition-colors duration-200 hover:text-boxx-white";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-boxx-line bg-boxx-coal">
      <div className="absolute -top-32 left-1/2 h-64 w-2xl -translate-x-1/2 rounded-full bg-boxx-red opacity-[0.07] blur-3xl" />

      {/* Link columns */}
      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Link
            href="/"
            className="font-heading text-2xl uppercase tracking-wide text-boxx-white"
          >
            <Image src="/logo.png" alt={site.name} width={150} height={50} />
          </Link>{" "}
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            {site.description}
          </p>
          <div className="mt-6 flex gap-3">
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

        <div className="lg:col-span-2">
          <ColumnLabel>Experiences</ColumnLabel>
          <ul className="mt-5 space-y-3">
            {experiences.map((exp) => (
              <li key={exp.slug}>
                <Link href={exp.href} className={footerLinkClass}>
                  {exp.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <ColumnLabel>Explore</ColumnLabel>
          <ul className="mt-5 space-y-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={footerLinkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <ColumnLabel>Find us</ColumnLabel>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <HugeiconsIcon
                icon={Location01Icon}
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-boxx-dim"
              />
              {contact.address}
            </li>
            <li>
              <a
                href={`tel:${contact.phone}`}
                className="inline-flex items-center gap-2.5 transition-colors duration-200 hover:text-boxx-white"
              >
                <HugeiconsIcon
                  icon={Call02Icon}
                  aria-hidden
                  className="size-4 shrink-0 text-boxx-dim"
                />
                {contact.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-2.5 transition-colors duration-200 hover:text-boxx-white"
              >
                <HugeiconsIcon
                  icon={Mail01Icon}
                  aria-hidden
                  className="size-4 shrink-0 text-boxx-dim"
                />
                {contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Legal bar */}
      <div className="relative border-t border-boxx-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-boxx-dim sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>{site.tagline}</p>
        </div>
      </div>

      <div aria-hidden className="relative select-none">
        <p className="translate-y-[18%] whitespace-nowrap text-center font-heading text-[15.5vw] uppercase leading-none tracking-wide text-stroke">
          BoxxCentral
        </p>
      </div>
    </footer>
  );
}
