import Link from "next/link";
import { experiences } from "@/lib/experiences";
import { contact, navLinks, site, socials } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-boxx-line bg-boxx-coal">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-lg font-bold tracking-tight text-boxx-white">
            Boxx<span className="text-boxx-red">Central</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed">{site.description}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-boxx-dim">
            Experiences
          </p>
          <ul className="mt-4 space-y-2.5">
            {experiences.map((exp) => (
              <li key={exp.slug}>
                <Link
                  href={exp.href}
                  className="text-sm text-boxx-mist transition-colors hover:text-boxx-white"
                >
                  {exp.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-boxx-dim">
            Find us
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>{contact.address}</li>
            <li>
              <a href={`tel:${contact.phone}`} className="transition-colors hover:text-boxx-white">
                {contact.phone}
              </a>
            </li>
            <li>
              <a
                href={contact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-boxx-white"
              >
                WhatsApp
              </a>
            </li>
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-boxx-white"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-boxx-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-boxx-dim sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <nav className="flex gap-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-boxx-mist">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
