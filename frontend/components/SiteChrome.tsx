"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

/**
 * Routes that run outside the marketing shell — no Navbar, no Footer.
 * The admin area and login ship their own chrome; the BowlBoxx leaderboard
 * (TV display + staff edit console) needs a bare canvas too.
 */
const BARE_PREFIXES = ["/admin", "/login", "/bowlboxx/leaderboard"];

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const bare = BARE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (bare) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
