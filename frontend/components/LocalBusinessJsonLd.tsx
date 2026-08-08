import { contact, site, socials } from "@/lib/site";

const DAYS = {
  "Monday – Thursday": ["Monday", "Tuesday", "Wednesday", "Thursday"],
  "Friday – Sunday": ["Friday", "Saturday", "Sunday"],
} as const;

// "10:00 – 22:00" -> ["10:00", "22:00"]; a midnight close is written as
// 23:59 since schema.org's Time type doesn't have a clean way to say
// "00:00 the following day"
function parseHours(time: string): [string, string] {
  const [opens, closesRaw] = time.split("–").map((t) => t.trim());
  const closes = closesRaw === "00:00" ? "23:59" : closesRaw;
  return [opens, closes];
}

/** Site-wide LocalBusiness structured data — feeds Google's knowledge panel / local pack. */
export default function LocalBusinessJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EntertainmentBusiness",
    name: site.name,
    description: site.description,
    url: site.url,
    telephone: contact.phone,
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Fadeyi Estate off Ilesa Road",
      addressLocality: "Oshogbo",
      addressRegion: "Osun State",
      addressCountry: "NG",
    },
    openingHoursSpecification: contact.hours.map(({ days, time }) => {
      const [opens, closes] = parseHours(time);
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAYS[days],
        opens,
        closes,
      };
    }),
    sameAs: socials.map((s) => s.href),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
