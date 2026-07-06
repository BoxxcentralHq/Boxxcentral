/**
 * The four BoxxCentral experiences — single source of truth consumed by
 * the home page cards, the services catalogue, and each sub-brand page.
 *
 * All copy here is placeholder-grade and awaits client sign-off.
 * The lounge has no confirmed sub-brand name yet ("LoungeBoxx"?) — its
 * `name` is deliberately generic until the client confirms.
 */

export type Experience = {
  slug: string;
  /** Sub-brand name (FilmBoxx, GymBoxx, …). */
  name: string;
  /** What it is, in plain words. */
  kind: string;
  /** One-line hook used on cards and heroes. */
  tagline: string;
  /** Short paragraph for cards and the services catalogue. */
  summary: string;
  /** Longer copy for the sub-brand page itself. */
  story: string;
  /** Feature bullets for the sub-brand page. */
  highlights: string[];
  href: string;
  /** True only for FilmBoxx — the transactional experience. */
  bookable: boolean;
};

export const experiences: Experience[] = [
  {
    slug: "filmboxx",
    name: "FilmBoxx",
    kind: "Private Cinema",
    tagline: "The big screen, all to yourself.",
    summary:
      "A private cinema experience built for you and yours — your session, your crowd, your moment on the big screen.",
    story:
      "FilmBoxx is BoxxCentral's private cinema — an intimate, high-end screening room you book for yourself and your people. Birthdays, date nights, premieres among friends, or just you and a film the way it was meant to be seen.",
    highlights: [
      "Private screening room for your group",
      "Cinema-grade picture and sound",
      "Sessions bookable online, paid securely with Paystack",
      "Lounge and refreshments a few steps away",
    ],
    href: "/filmboxx",
    bookable: true,
  },
  {
    slug: "gymboxx",
    name: "GymBoxx",
    kind: "Gym Studio",
    tagline: "Train hard. Recover in style.",
    summary:
      "A fully equipped gym studio inside BoxxCentral — modern machines, focused energy, zero excuses.",
    story:
      "GymBoxx is the fitness heart of BoxxCentral. A clean, modern studio with serious equipment and an atmosphere that gets you moving — then the rest of BoxxCentral is right there when the work is done.",
    highlights: [
      "Modern strength and cardio equipment",
      "Focused, motivating studio atmosphere",
      "Part of the full BoxxCentral experience",
    ],
    href: "/gymboxx",
    bookable: false,
  },
  {
    slug: "bowlboxx",
    name: "BowlBoxx",
    kind: "Bowling",
    tagline: "Strikes, spares, and bragging rights.",
    summary:
      "Bowling the BoxxCentral way — lanes, lights, music, and friendly rivalry that gets loud.",
    story:
      "BowlBoxx brings the classic bowling night into the BoxxCentral world — glowing lanes, great music, and the kind of competition that turns an evening into a story.",
    highlights: [
      "Full bowling lanes with scoring",
      "Music and lights that set the mood",
      "Perfect for groups, dates, and rivalries",
    ],
    href: "/bowlboxx",
    bookable: false,
  },
  {
    slug: "lounge",
    name: "The Lounge", // TODO: confirm sub-brand name with client (LoungeBoxx?)
    kind: "Lounge",
    tagline: "Slow down. Sip. Stay a while.",
    summary:
      "The warm center of BoxxCentral — drinks, small plates, and conversation before or after everything else.",
    story:
      "The Lounge is where BoxxCentral breathes. Come down from a film, a game, or a workout — or skip straight here. Warm light, good drinks, and a menu made for lingering.",
    highlights: [
      "Signature drinks and small plates",
      "Warm, intimate atmosphere",
      "The meeting point between all four experiences",
    ],
    href: "/lounge",
    bookable: false,
  },
];

export const getExperience = (slug: string): Experience => {
  const experience = experiences.find((e) => e.slug === slug);
  if (!experience) throw new Error(`Unknown experience: ${slug}`);
  return experience;
};
