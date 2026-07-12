"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Menu09Icon,
  ShoppingCart01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { bookingCta, navLinks, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import Image from "next/image";

/**
 * Sub-brand pages swap the navbar logo for their own mark; everywhere else
 * shows the main BoxxCentral logo. Dimensions match each PNG's aspect ratio.
 */
const brandLogos: Record<string, { src: string; alt: string; width: number; height: number }> = {
  "/filmboxx": { src: "/filmboxx.png", alt: "FilmBoxx", width: 148, height: 39 },
  "/bowlboxx": { src: "/bowlboxx.png", alt: "BowlBoxx", width: 168, height: 28 },
};

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const logo = brandLogos[pathname] ?? {
    src: "/logo.png",
    alt: site.name,
    width: 150,
    height: 50,
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkBase =
    "text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-200";

  const desktopLinkClass = (href: string) =>
    cn(
      linkBase,
      "rounded-xl px-4 py-2",
      isActive(href)
        ? "bg-boxx-red/10 text-boxx-red"
        : "text-boxx-mist hover:text-boxx-white",
    );

  const mobileLinkClass = (href: string) =>
    cn(
      linkBase,
      "rounded-md px-3 py-3",
      isActive(href)
        ? "bg-boxx-red/10 text-boxx-red"
        : "text-boxx-mist hover:text-boxx-white",
    );

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-2 md:px-0">
      <div className="mx-auto ms:w-4/5 w-full  max-w-6xl rounded-3xl border border-white/10 bg-white/5 shadow-md shadow-black/25 backdrop-blur-xl backdrop-saturate-150">
        <nav className="relative flex h-18 w-full items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="font-heading text-2xl uppercase tracking-wide text-boxx-white"
            onClick={() => setOpen(false)}
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
            />
          </Link>

          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={desktopLinkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center md:gap-2 gap-1">
            <Button asChild variant="ghost" size="icon" aria-label="Cart">
              <Link href="/cart" onClick={() => setOpen(false)}>
                <HugeiconsIcon icon={ShoppingCart01Icon} className="size-5" />
              </Link>
            </Button>

            <Button asChild size="sm" className="hidden lg:inline-flex">
              <Link href={bookingCta.href}>{bookingCta.label}</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden "
              aria-label={
                open ? `Close ${site.name} menu` : `Open ${site.name} menu`
              }
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <HugeiconsIcon
                icon={open ? Cancel01Icon : Menu09Icon}
                className="size-5"
              />
            </Button>
          </div>
        </nav>

        {open && (
          <div className="animate-in fade-in slide-in-from-top-2 rounded-b-3xl border-t border-white/10 duration-200 lg:hidden">
            <div className="flex w-full flex-col gap-1 px-5 py-5 sm:px-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={mobileLinkClass(link.href)}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild className="mt-3">
                <Link href={bookingCta.href} onClick={() => setOpen(false)}>
                  {bookingCta.label}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
