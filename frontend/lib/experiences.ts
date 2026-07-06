/**
 * The four BoxxCentral experiences — single source of truth consumed by
 * the home page cards, the services catalogue, and each sub-brand page.
 *
 * Copy is placeholder-grade and awaits client sign-off. Photos and videos
 * are free Pexels stock stand-ins until the client's own facility assets
 * arrive — swap the files in /public/images and /public/videos.
 * The lounge has no confirmed sub-brand name yet ("LoungeBoxx"?) — its
 * `name` is deliberately generic until the client confirms.
 */

/** A sourced photo under /public. */
export type Media = { src: string; alt: string };

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
  /** Card / feature photo used on the home grid and services catalogue. */
  image: Media;
  /** Sub-brand page hero — consumed by <ExperiencePage>. */
  hero: {
    cta: { label: string; href: string };
    /** Small print under the CTA (e.g. "booking coming soon"). */
    note?: string;
    /** Background video under /public. */
    videoSrc: string;
  };
  /** Sub-brand page showcase section — consumed by <ExperiencePage>. */
  showcase: {
    eyebrow: string;
    title: string;
    /** [wide shot, detail A, detail B]. */
    media: [Media, Media, Media];
    /** Media column leads on desktop (alternating rhythm across pages). */
    mediaFirst?: boolean;
  };
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
    image: {
      src: "/images/filmboxx-wide.jpg",
      alt: "Empty cinema hall with the screen glowing in the dark",
    },
    hero: {
      cta: { label: "Book a private session", href: "/filmboxx" },
      note: "Online booking with Paystack — coming soon",
      videoSrc: "/videos/filmboxx.mp4",
    },
    showcase: {
      eyebrow: "The experience",
      title: "Your screen. Your people.",
      media: [
        {
          src: "/images/filmboxx-wide.jpg",
          alt: "Screening room with the lights down",
        },
        {
          src: "/images/filmboxx-detail-1.jpg",
          alt: "Rows of red cinema seats",
        },
        {
          src: "/images/filmboxx-detail-2.jpg",
          alt: "Popcorn ready for the show",
        },
      ],
    },
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
    image: {
      src: "/images/gymboxx-wide.jpg",
      alt: "Modern gym interior with dramatic lighting",
    },
    hero: {
      cta: { label: "Ask about membership", href: "/contact" },
      videoSrc: "/videos/gymboxx.mp4",
    },
    showcase: {
      eyebrow: "The studio",
      title: "Where the work gets done",
      media: [
        {
          src: "/images/gymboxx-wide.jpg",
          alt: "Gym floor with modern equipment",
        },
        {
          src: "/images/gymboxx-detail-1.jpg",
          alt: "Black and red dumbbells on the rack",
        },
        {
          src: "/images/gymboxx-detail-2.jpg",
          alt: "Punching bags hanging in the studio",
        },
      ],
      mediaFirst: true,
    },
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
    image: {
      src: "/images/bowlboxx-wide.jpg",
      alt: "Dimly lit bowling alley at night",
    },
    hero: {
      cta: { label: "Plan a game night", href: "/contact" },
      videoSrc: "/videos/bowlboxx.mp4",
    },
    showcase: {
      eyebrow: "The lanes",
      title: "Loud nights, clean strikes",
      media: [
        {
          src: "/images/bowlboxx-wide.jpg",
          alt: "Bowling lanes under moody lighting",
        },
        {
          src: "/images/bowlboxx-detail-1.jpg",
          alt: "Bowling pins washed in red light",
        },
        {
          src: "/images/bowlboxx-detail-2.jpg",
          alt: "Bowling ball and shoes on the lane",
        },
      ],
    },
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
    image: {
      src: "/images/lounge-wide.jpg",
      alt: "Bartender mixing cocktails at a stylish bar",
    },
    hero: {
      cta: { label: "Find us tonight", href: "/contact" },
      videoSrc: "/videos/lounge.mp4",
    },
    showcase: {
      eyebrow: "The room",
      title: "The soft landing",
      media: [
        {
          src: "/images/lounge-wide.jpg",
          alt: "Bar counter in warm, moody light",
        },
        {
          src: "/images/lounge-detail-1.jpg",
          alt: "Cocktail served in close-up",
        },
        {
          src: "/images/lounge-detail-2.jpg",
          alt: "Barman preparing drinks",
        },
      ],
      mediaFirst: true,
    },
  },
];

export const getExperience = (slug: string): Experience => {
  const experience = experiences.find((e) => e.slug === slug);
  if (!experience) throw new Error(`Unknown experience: ${slug}`);
  return experience;
};
