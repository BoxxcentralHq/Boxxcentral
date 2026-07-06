import {
  InstagramIcon,
  NewTwitterIcon,
  TiktokIcon,
} from "@hugeicons/core-free-icons";

/**
 * Global site configuration — single source of truth for brand copy,
 * navigation, and contact details.
 */

export const site = {
  name: "BoxxCentral",
  tagline: "Four experiences. One address.",
  description:
    "BoxxCentral is a premium lifestyle and recreation destination — private cinema, gym studio, bowling, and lounge, all under one roof.",
  url: "https://boxxcentral.com",
} as const;

export const contact = {
  address: "Fadeyi Estate off Ilesa Road,Oshogbo, Osun State,Nigeria",
  phone: "+234 706 349 2072",
  whatsapp: "https://wa.me/2347063492072",
  email: "info@boxxcentral.com",
  hours: [
    { days: "Monday – Thursday", time: "10:00 – 22:00" },
    { days: "Friday – Saturday", time: "10:00 – 00:00" },
    { days: "Sunday", time: "12:00 – 22:00" },
  ],
} as const;

export const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/boxxcentral",
    icon: InstagramIcon,
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/boxxcentral",
    icon: NewTwitterIcon,
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@boxxcentral",
    icon: TiktokIcon,
  },
] as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
] as const;

export const bookingCta = {
  label: "Book now",
  href: "/book",
} as const;
