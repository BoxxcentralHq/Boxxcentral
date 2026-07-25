"use client";

import { useMemo, useState } from "react";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { menuItems, type MenuCategory, type MenuItem } from "@/lib/menu";
import MenuFilters, { type ViewMode } from "./MenuFilters";
import MenuGrid from "./MenuGrid";
import MenuItemDialog from "./MenuItemDialog";

/** The Lounge's menu: searchable, filterable by category, grid or list view. */
export default function MenuSection() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<MenuCategory | "All">("All");
  const [view, setView] = useState<ViewMode>("grid");

  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menuItems.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesQuery =
        q === "" ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  const handleSelect = (item: MenuItem) => {
    setActiveItem(item);
    setDialogOpen(true);
  };

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="The menu"
            title="Something for every mood"
            lede="Small plates, wood-fired pizza, and a bar that runs from classic cocktails to zero-proof. Search, filter, or just browse."
          />
        </Reveal>

        <Reveal delay={100} variant="down" className="mt-10">
          <MenuFilters
            query={query}
            onQueryChange={setQuery}
            category={category}
            onCategoryChange={setCategory}
            view={view}
            onViewChange={setView}
            resultCount={filteredItems.length}
          />
        </Reveal>

        <div className="mt-10">
          <MenuGrid items={filteredItems} view={view} onSelect={handleSelect} />
        </div>
      </Container>

      <MenuItemDialog
        item={activeItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </section>
  );
}
