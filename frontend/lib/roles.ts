import type { AdminRole } from "@/lib/api/types";

/** Admin surfaces that aren't open to every signed-in role. */
export type AdminSection =
  | "bookings"
  | "movies"
  | "messages"
  | "menu"
  | "payments"
  | "settings";

const SECTION_ACCESS: Record<AdminSection, AdminRole[]> = {
  bookings: ["super_admin", "cinema_admin"],
  movies: ["super_admin", "cinema_admin"],
  messages: ["super_admin"],
  menu: ["super_admin", "lounge_admin"],
  payments: ["super_admin"],
  settings: ["super_admin"],
};

export function canAccess(role: AdminRole, section: AdminSection): boolean {
  return SECTION_ACCESS[section].includes(role);
}

// Paths not listed here (the overview, the account page) are open to every
// signed-in role — only these need a role check.
const SECTION_BY_PATH: [prefix: string, section: AdminSection][] = [
  ["/admin/bookings", "bookings"],
  ["/admin/movies", "movies"],
  ["/admin/messages", "messages"],
  ["/admin/menu", "menu"],
  ["/admin/payments", "payments"],
  ["/admin/settings", "settings"],
];

export function sectionForPath(pathname: string): AdminSection | null {
  return SECTION_BY_PATH.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? null;
}
