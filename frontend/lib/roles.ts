import type { AdminRole } from "@/lib/api/types";

export type AdminSection =
  | "movies"
  | "messages"
  | "menu"
  | "gym"
  | "payments"
  | "settings";

const SECTION_ACCESS: Record<AdminSection, AdminRole[]> = {
  movies: ["super_admin", "cinema_admin"],
  messages: ["super_admin"],
  menu: ["super_admin", "lounge_admin"],
  gym: ["super_admin", "gym_admin"],
  payments: ["super_admin"],
  settings: ["super_admin"],
};

export function canAccess(role: AdminRole, section: AdminSection): boolean {
  return SECTION_ACCESS[section].includes(role);
}

const SECTION_BY_PATH: [prefix: string, section: AdminSection][] = [
  ["/admin/movies", "movies"],
  ["/admin/messages", "messages"],
  ["/admin/menu", "menu"],
  ["/admin/gym", "gym"],
  ["/admin/payments", "payments"],
  ["/admin/settings", "settings"],
];

export function sectionForPath(pathname: string): AdminSection | null {
  return SECTION_BY_PATH.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? null;
}
