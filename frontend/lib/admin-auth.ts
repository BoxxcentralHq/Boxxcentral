"use client";

/**
 * Stub admin session — browser-only, no server involved.
 *
 * TODO: replace with real authentication once the NestJS backend exposes
 * an auth endpoint (JWT/session cookie). Everything that consumes this
 * module (login form, admin guard, logout) only touches these four
 * functions, so the swap stays contained.
 */

const SESSION_KEY = "boxxcentral-admin-session";

/** Demo credentials accepted by the stub. */
export const DEMO_CREDENTIALS = {
  email: "admin@boxxcentral.com",
  password: "boxxcentral",
} as const;

export function signIn(email: string, password: string): boolean {
  const ok =
    email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
    password === DEMO_CREDENTIALS.password;
  if (ok) {
    window.localStorage.setItem(SESSION_KEY, new Date().toISOString());
  }
  return ok;
}

export function signOut(): void {
  window.localStorage.removeItem(SESSION_KEY);
}

export function isSignedIn(): boolean {
  return window.localStorage.getItem(SESSION_KEY) !== null;
}
