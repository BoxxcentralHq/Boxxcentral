/**
 * Global site configuration — single source of truth for brand copy,
 * navigation, and contact details. Placeholder values are marked TODO
 * and tracked in the asset/content shopping list for the client.
 */

export const site = {
  name: "BoxxCentral",
  tagline: "Four experiences. One address.",
  description:
    "BoxxCentral is a premium lifestyle and recreation destination — private cinema, gym studio, bowling, and lounge, all under one roof.",
  url: "https://boxxcentral.com", // TODO: confirm live domain
} as const;

export const contact = {
  address: "BoxxCentral, Lagos, Nigeria", // TODO: real physical address
  phone: "+234 000 000 0000", // TODO: real phone number
  whatsapp: "https://wa.me/2340000000000", // TODO: real WhatsApp number
  email: "hello@boxxcentral.com", // TODO: real email
  hours: [
    { days: "Monday – Thursday", time: "10:00 – 22:00" },
    { days: "Friday – Saturday", time: "10:00 – 00:00" },
    { days: "Sunday", time: "12:00 – 22:00" },
  ], // TODO: real opening hours
} as const;

export const socials = [
  { label: "Instagram", href: "https://instagram.com/boxxcentral" }, // TODO
  { label: "X (Twitter)", href: "https://x.com/boxxcentral" }, // TODO
  { label: "TikTok", href: "https://tiktok.com/@boxxcentral" }, // TODO
] as const;

/** Primary navigation, in display order. */
export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "FilmBoxx", href: "/filmboxx" },
  { label: "GymBoxx", href: "/gymboxx" },
  { label: "BowlBoxx", href: "/bowlboxx" },
  { label: "Contact", href: "/contact" },
] as const;

/** The one commercial CTA — follows the user across the whole site. */
export const bookingCta = {
  label: "Book FilmBoxx",
  href: "/filmboxx", // later: /filmboxx/book once the booking flow exists
} as const;
