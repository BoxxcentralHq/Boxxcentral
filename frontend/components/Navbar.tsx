"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Menu01Icon,
  ShoppingCart01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { bookingCta, navLinks, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkClass = (href: string) =>
    cn(
      "text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-200",
      pathname === href
        ? "text-boxx-red"
        : "text-boxx-mist hover:text-boxx-white",
    );

  return (
    <header className="fixed inset-x-0 top-4 z-50">
      <div className="mx-auto w-4/5 max-w-6xl rounded-3xl border border-boxx-line bg-boxx-night/85 backdrop-blur-md">
        <nav className="relative flex h-18 w-full items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="font-heading text-2xl uppercase tracking-wide text-boxx-white"
            onClick={() => setOpen(false)}
          >
            <Image src="/logo.png" alt={site.name} width={150} height={50} />
          </Link>

          {/* Desktop links — centered */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" aria-label="Cart">
              <Link href="/cart" onClick={() => setOpen(false)}>
                <HugeiconsIcon icon={ShoppingCart01Icon} className="size-5" />
              </Link>
            </Button>

            <Button asChild size="sm" className="hidden lg:inline-flex">
              <Link href={bookingCta.href}>{bookingCta.label}</Link>
            </Button>

            {/* Mobile toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label={
                open ? `Close ${site.name} menu` : `Open ${site.name} menu`
              }
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <HugeiconsIcon
                icon={open ? Cancel01Icon : Menu01Icon}
                className="size-5"
              />
            </Button>
          </div>
        </nav>

        {/* Mobile menu */}
        {open && (
          <div className="animate-in fade-in slide-in-from-top-2 rounded-b-3xl border-t border-boxx-line bg-boxx-night duration-200 lg:hidden">
            <div className="flex w-full flex-col gap-1 px-5 py-5 sm:px-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn("rounded-md px-2 py-3", linkClass(link.href))}
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
