"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Menu09Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { bookingCta, navLinks, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import Image from "next/image";

/**
 * Sub-brand pages swap the navbar logo for their own mark; everywhere else
 * shows the main BoxxCentral logo. Dimensions match each PNG's aspect ratio.
 */
const brandLogos: Record<
  string,
  { src: string; alt: string; width: number; height: number }
> = {
  "/filmboxx": {
    src: "/filmboxx.png",
    alt: "FilmBoxx",
    width: 148,
    height: 39,
  },
  "/bowlboxx": {
    src: "/bowlboxx.png",
    alt: "BowlBoxx",
    width: 168,
    height: 28,
  },
};

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  // Lock body scroll and allow Escape to dismiss while the full-screen menu is up.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

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
      "font-heading text-4xl uppercase leading-tight tracking-wide transition-colors duration-200",
      isActive(href)
        ? "text-boxx-red"
        : "text-boxx-white/90 hover:text-boxx-red",
    );

  return (
    <>
      <motion.header
        initial={reduceMotion ? undefined : { opacity: 0, y: -24 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="fixed inset-x-0 top-4 z-50 px-2 md:px-0"
      >
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
              <Button asChild variant="ghost" size="sm">
                <Link href="/lounge" onClick={() => setOpen(false)}>
                  View Menu
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
        </div>
      </motion.header>

      {/*
        Full-screen mobile menu. Rendered outside the header's blurred pill on
        purpose: `backdrop-blur` on an ancestor creates a containing block for
        `position: fixed` descendants, which would trap this overlay inside
        the pill's small bounds instead of covering the viewport.
      */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-40 bg-boxx-night lg:hidden"
          >
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.05,
              }}
              className="flex h-full flex-col justify-center gap-3 px-8 pb-16"
            >
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
              <Button asChild size="lg" className="mt-6 w-fit">
                <Link href={bookingCta.href} onClick={() => setOpen(false)}>
                  {bookingCta.label}
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
