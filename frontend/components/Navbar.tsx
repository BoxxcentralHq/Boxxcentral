"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { bookingCta, navLinks, site } from "@/lib/site";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkClass = (href: string) =>
    `text-sm transition-colors duration-200 ${
      pathname === href
        ? "text-boxx-white font-semibold"
        : "text-boxx-mist hover:text-boxx-white"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-boxx-line bg-boxx-night/90 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-boxx-white"
          onClick={() => setOpen(false)}
        >
          Boxx<span className="text-boxx-red">Central</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
          <Link
            href={bookingCta.href}
            className="rounded-full bg-boxx-red px-5 py-2 text-sm font-semibold text-boxx-white transition-colors duration-200 hover:bg-boxx-red-deep"
          >
            {bookingCta.label}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md text-boxx-white lg:hidden"
          aria-label={open ? `Close ${site.name} menu` : `Open ${site.name} menu`}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-xl leading-none">{open ? "✕" : "☰"}</span>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-boxx-line bg-boxx-night lg:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-4 sm:px-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-2 py-2.5 ${linkClass(link.href)}`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={bookingCta.href}
              className="mt-2 rounded-full bg-boxx-red px-5 py-3 text-center text-sm font-semibold text-boxx-white"
              onClick={() => setOpen(false)}
            >
              {bookingCta.label}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
