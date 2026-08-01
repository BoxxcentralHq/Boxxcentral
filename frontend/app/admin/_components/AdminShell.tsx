"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Calendar03Icon,
  Cancel01Icon,
  ClapperboardIcon,
  DashboardSquare01Icon,
  Logout03Icon,
  Menu09Icon,
  Message01Icon,
  RestaurantIcon,
  Settings01Icon,
  UserAccountIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import { useLogout, useProfile } from "@/lib/auth";
import { canAccess, sectionForPath, type AdminSection } from "@/lib/roles";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: IconSvgElement;
  /** Omitted means every signed-in role can see this item. */
  section?: AdminSection;
};

const navItems: NavItem[] = [
  { label: "Overview", href: "/admin", icon: DashboardSquare01Icon },
  { label: "Bookings", href: "/admin/bookings", icon: Calendar03Icon, section: "bookings" },
  { label: "Movies", href: "/admin/movies", icon: ClapperboardIcon, section: "movies" },
  { label: "Messages", href: "/admin/messages", icon: Message01Icon, section: "messages" },
  { label: "Menu", href: "/admin/menu", icon: RestaurantIcon, section: "menu" },
  { label: "Payments", href: "/admin/payments", icon: Wallet01Icon, section: "payments" },
  { label: "Settings", href: "/admin/settings", icon: Settings01Icon, section: "settings" },
  { label: "Account", href: "/admin/account", icon: UserAccountIcon },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const base =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-200";

  return (
    <Link
      href={item.href}
      className={cn(
        base,
        active
          ? "bg-boxx-red/10 text-boxx-red"
          : "text-boxx-mist hover:bg-boxx-slate hover:text-boxx-white",
      )}
    >
      <HugeiconsIcon icon={item.icon} aria-hidden className="size-4.5" />
      {item.label}
    </Link>
  );
}

/**
 * Admin chrome: fixed sidebar on desktop, top strip on mobile, and the
 * client-side session guard. Children render only for signed-in staff.
 */
export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: profile, isError } = useProfile();
  const logout = useLogout();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (isError) router.replace("/login");
  }, [isError, router]);

  // Deep-linking into a section this role can't use bounces back to the overview.
  useEffect(() => {
    if (!profile) return;
    const section = sectionForPath(pathname);
    if (section && !canAccess(profile.role, section)) router.replace("/admin");
  }, [profile, pathname, router]);

  // A route change means a nav link was just used — close the mobile drawer.
  useEffect(() => setNavOpen(false), [pathname]);

  // Lock body scroll and allow Escape to dismiss while the mobile drawer is up.
  useEffect(() => {
    if (!navOpen) return;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navOpen]);

  function handleSignOut() {
    logout.mutate();
  }

  if (!profile) {
    return (
      <div className="flex min-h-svh items-center justify-center text-xs font-bold uppercase tracking-[0.3em] text-boxx-dim">
        Checking session…
      </div>
    );
  }

  const visibleNavItems = navItems.filter(
    (item) => !item.section || canAccess(profile.role, item.section),
  );

  const sidebarNav = (
    <nav className="flex flex-col gap-1.5">
      {visibleNavItems.map((item) => (
        <NavLink key={item.href} item={item} active={pathname === item.href} />
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-svh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-boxx-line bg-boxx-coal p-6 lg:flex">
        <Link href="/admin" className="inline-block">
          <Image src="/logo.png" alt={site.name} width={130} height={43} />
        </Link>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-boxx-dim">
          Staff dashboard
        </p>

        <div className="mt-8 flex-1">{sidebarNav}</div>

        <div className="space-y-1.5 border-t border-boxx-line pt-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-boxx-mist transition-colors duration-200 hover:bg-boxx-slate hover:text-boxx-white"
          >
            View site
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-boxx-mist transition-colors duration-200 hover:bg-boxx-red/10 hover:text-boxx-red"
          >
            <HugeiconsIcon icon={Logout03Icon} aria-hidden className="size-4.5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top strip */}
        <header className="flex items-center justify-between border-b border-boxx-line bg-boxx-coal px-5 py-4 lg:hidden">
          <Link href="/admin">
            <Image src="/logo.png" alt={site.name} width={110} height={37} />
          </Link>
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
            aria-expanded={navOpen}
            className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-red"
          >
            <HugeiconsIcon icon={Menu09Icon} aria-hidden className="size-4.5" />
          </button>
        </header>

        <div className="flex-1 px-5 py-8 sm:px-8 lg:px-10">{children}</div>
      </div>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setNavOpen(false)}
              className="fixed inset-0 z-40 bg-boxx-night/80 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex h-svh w-72 flex-col border-r border-boxx-line bg-boxx-coal p-6 lg:hidden"
            >
              <div className="flex items-center justify-between">
                <Link href="/admin">
                  <Image src="/logo.png" alt={site.name} width={130} height={43} />
                </Link>
                <button
                  type="button"
                  onClick={() => setNavOpen(false)}
                  aria-label="Close menu"
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-red"
                >
                  <HugeiconsIcon icon={Cancel01Icon} aria-hidden className="size-4" />
                </button>
              </div>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-boxx-dim">
                Staff dashboard
              </p>

              <div className="mt-8 flex-1 overflow-y-auto">{sidebarNav}</div>

              <div className="space-y-1.5 border-t border-boxx-line pt-4">
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-boxx-mist transition-colors duration-200 hover:bg-boxx-slate hover:text-boxx-white"
                >
                  View site
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-boxx-mist transition-colors duration-200 hover:bg-boxx-red/10 hover:text-boxx-red"
                >
                  <HugeiconsIcon icon={Logout03Icon} aria-hidden className="size-4.5" />
                  Log out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
