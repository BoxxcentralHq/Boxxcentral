"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Calendar03Icon,
  DashboardSquare01Icon,
  Logout03Icon,
  Message01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { useLogout, useProfile } from "@/lib/auth";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: IconSvgElement;
  /** Not built yet — rendered inert with a "soon" tag. */
  soon?: boolean;
};

const navItems: NavItem[] = [
  { label: "Overview", href: "/admin", icon: DashboardSquare01Icon },
  { label: "Bookings", href: "/admin/bookings", icon: Calendar03Icon },
  { label: "Messages", href: "/admin/messages", icon: Message01Icon },
  { label: "Settings", href: "/admin/settings", icon: Settings01Icon, soon: true },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const base =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-200";

  if (item.soon) {
    return (
      <span className={cn(base, "cursor-not-allowed text-boxx-dim")}>
        <HugeiconsIcon icon={item.icon} aria-hidden className="size-4.5" />
        {item.label}
        <span className="ml-auto rounded-full border border-boxx-line px-2 py-0.5 text-[10px] tracking-widest">
          Soon
        </span>
      </span>
    );
  }

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

  useEffect(() => {
    if (isError) router.replace("/login");
  }, [isError, router]);

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

  const sidebarNav = (
    <nav className="flex flex-col gap-1.5">
      {navItems.map((item) => (
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
            onClick={handleSignOut}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-boxx-line px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-red"
          >
            <HugeiconsIcon icon={Logout03Icon} aria-hidden className="size-4" />
            Log out
          </button>
        </header>

        <div className="flex-1 px-5 py-8 sm:px-8 lg:px-10">{children}</div>
      </div>
    </div>
  );
}
