/**
 * Placeholder data for the admin dashboard — realistic shapes so the UI is
 * honest about what it will render, but entirely static.
 *
 * TODO: replace with live queries once the NestJS backend exposes
 * bookings/messages endpoints. Keep the exported types; they are the
 * contract the dashboard components are built against.
 */

export type BookingStatus = "confirmed" | "pending" | "cancelled";

export type Booking = {
  id: string;
  guestName: string;
  /** Phone or email, as entered on the booking form. */
  contact: string;
  /** Experience name (FilmBoxx, GymBoxx, …). */
  experience: string;
  /** ISO date (yyyy-MM-dd). */
  date: string;
  /** 24h start time (HH:mm). */
  time: string;
  guests: number;
  status: BookingStatus;
};

export type ContactMessage = {
  id: string;
  name: string;
  /** Phone or email, as entered on the contact form. */
  contact: string;
  topic: string;
  preview: string;
  /** Full message text shown in the expanded view. */
  body: string;
  /** Human-relative time, e.g. "2h ago". */
  receivedAgo: string;
  unread: boolean;
};

export const bookings: Booking[] = [
  {
    id: "BX-1042",
    guestName: "Adaeze Okonkwo",
    contact: "+234 803 555 0184",
    experience: "FilmBoxx",
    date: "2026-07-07",
    time: "19:00",
    guests: 8,
    status: "confirmed",
  },
  {
    id: "BX-1041",
    guestName: "Tunde Bakare",
    contact: "tunde.b@example.com",
    experience: "BowlBoxx",
    date: "2026-07-07",
    time: "16:00",
    guests: 6,
    status: "confirmed",
  },
  {
    id: "BX-1040",
    guestName: "Halima Yusuf",
    contact: "+234 706 555 0132",
    experience: "FilmBoxx",
    date: "2026-07-08",
    time: "20:00",
    guests: 12,
    status: "pending",
  },
  {
    id: "BX-1039",
    guestName: "Emeka Obi",
    contact: "+234 812 555 077",
    experience: "Lounge",
    date: "2026-07-08",
    time: "21:00",
    guests: 15,
    status: "pending",
  },
  {
    id: "BX-1038",
    guestName: "Folake Adeyemi",
    contact: "folake.a@example.com",
    experience: "GymBoxx",
    date: "2026-07-09",
    time: "10:00",
    guests: 2,
    status: "confirmed",
  },
  {
    id: "BX-1037",
    guestName: "Ibrahim Sule",
    contact: "+234 905 555 0219",
    experience: "FilmBoxx",
    date: "2026-07-06",
    time: "18:00",
    guests: 10,
    status: "cancelled",
  },
  {
    id: "BX-1036",
    guestName: "Ngozi Umeh",
    contact: "ngozi.u@example.com",
    experience: "BowlBoxx",
    date: "2026-07-11",
    time: "17:00",
    guests: 9,
    status: "pending",
  },
  {
    id: "BX-1035",
    guestName: "Kunle Ajayi",
    contact: "+234 701 555 0143",
    experience: "Lounge",
    date: "2026-07-12",
    time: "20:00",
    guests: 20,
    status: "confirmed",
  },
];

export const messages: ContactMessage[] = [
  {
    id: "MSG-231",
    name: "Chiamaka Eze",
    contact: "+234 802 555 0167",
    topic: "Private event",
    preview:
      "Hi, we're planning a birthday for about 25 people on the 19th — can we take the cinema and lounge together?",
    body: "Hi, we're planning a birthday for about 25 people on the 19th — can we take the cinema and lounge together? We'd want the cinema from 7pm for a screening (we'll bring our own film on a drive if that's allowed) and then move to the lounge afterwards. Do you do decorations, or should we arrange that ourselves? A rough quote would be great.",
    receivedAgo: "1h ago",
    unread: true,
  },
  {
    id: "MSG-230",
    name: "Segun Alabi",
    contact: "segun.alabi@example.com",
    topic: "Group booking",
    preview:
      "Do you offer corporate rates? We're a team of 40 looking at a Friday evening slot.",
    body: "Do you offer corporate rates? We're a team of 40 looking at a Friday evening slot — ideally bowling and the lounge, sometime this month or early next. Our budget owner will want an invoice with your company details. Who should I speak to about availability?",
    receivedAgo: "4h ago",
    unread: true,
  },
  {
    id: "MSG-229",
    name: "Blessing Nwachukwu",
    contact: "+234 913 555 0102",
    topic: "General enquiry",
    preview:
      "Is the gym open to walk-ins or membership only? Also — do you have parking on site?",
    body: "Is the gym open to walk-ins or membership only? Also — do you have parking on site? I live close to Fadeyi Estate so I'd probably come in the mornings before work if the hours suit.",
    receivedAgo: "yesterday",
    unread: false,
  },
  {
    id: "MSG-228",
    name: "Femi Odukoya",
    contact: "femi.odu@example.com",
    topic: "Partnership",
    preview:
      "I run a film club in Osogbo — interested in a monthly screening partnership at FilmBoxx.",
    body: "I run a film club in Osogbo with about 60 active members — interested in a monthly screening partnership at FilmBoxx. We'd handle curation and promotion; you'd provide the room at a partner rate. Happy to come in and talk it through whenever works.",
    receivedAgo: "2 days ago",
    unread: false,
  },
  {
    id: "MSG-227",
    name: "Aisha Bello",
    contact: "+234 806 555 0195",
    topic: "General enquiry",
    preview:
      "Loved my visit last weekend! Quick one — do you host kids' parties on Sunday afternoons?",
    body: "Loved my visit last weekend! Quick one — do you host kids' parties on Sunday afternoons? Thinking bowling plus food for about 12 children (ages 8–10) and a few parents. What would that cost and how far ahead should I book?",
    receivedAgo: "3 days ago",
    unread: false,
  },
];

/** Headline numbers for the overview tiles, derived from today's picture. */
export const overviewStats = [
  { label: "Bookings today", value: "2", note: "next at 16:00" },
  { label: "Guests expected", value: "14", note: "across all experiences" },
  { label: "Pending approvals", value: "2", note: "awaiting confirmation" },
  { label: "Unread messages", value: "2", note: "oldest 4h ago" },
] as const;
