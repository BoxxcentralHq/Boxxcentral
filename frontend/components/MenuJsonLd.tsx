import type { MenuItem } from "@/lib/api/types";
import { site } from "@/lib/site";

/** Structured data for the Lounge menu — grouped by category, built from live data. */
export default function MenuJsonLd({ items }: { items: MenuItem[] }) {
  if (items.length === 0) return null;

  const categories = [...new Set(items.map((item) => item.category))];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `${site.name} Lounge Menu`,
    hasMenuSection: categories.map((category) => ({
      "@type": "MenuSection",
      name: category,
      hasMenuItem: items
        .filter((item) => item.category === category)
        .map((item) => ({
          "@type": "MenuItem",
          name: item.name,
          description: item.description,
          offers: {
            "@type": "Offer",
            price: item.price,
            priceCurrency: "NGN",
          },
        })),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
