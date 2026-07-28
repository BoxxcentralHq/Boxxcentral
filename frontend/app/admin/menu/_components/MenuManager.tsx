"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Delete02Icon,
  PencilEdit01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import Reveal from "@/components/Reveal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  menuCategories,
  menuItems as initialMenuItems,
  type MenuCategory,
  type MenuItem,
} from "@/lib/menu";
import { cn } from "@/lib/utils";

/** The only tags seen in the menu data — kept as toggles rather than free text. */
const availableTags = ["Popular", "Spicy", "Alcoholic", "Non-alcoholic"] as const;

const fieldClass =
  "w-full rounded-xl border border-boxx-line bg-boxx-night px-4 py-3 text-sm text-boxx-white placeholder:text-boxx-dim outline-none transition-colors duration-200 focus:border-boxx-red focus-visible:ring-[3px] focus-visible:ring-ring";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-bold uppercase tracking-[0.2em] text-boxx-dim">
      {children}
    </label>
  );
}

/** `"Suya Platter"` → `"suya-platter"` — the same id shape as the seed data. */
function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type FormState = {
  name: string;
  category: MenuCategory;
  price: string;
  description: string;
  tags: string[];
};

const emptyForm: FormState = {
  name: "",
  category: menuCategories[0],
  price: "",
  description: "",
  tags: [],
};

/**
 * The Lounge menu's admin surface — add, edit, and remove items over the
 * placeholder dataset. Mutates local state only.
 * TODO: call the menu API once the backend endpoint lands (lib/api/types.ts
 * already carries the real MenuItem contract for that swap).
 */
export default function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>(initialMenuItems);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<MenuCategory | "All">("All");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesQuery =
        q === "" ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [items, query, category]);

  function openAddDialog() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      category: category === "All" ? menuCategories[0] : category,
    });
    setDialogOpen(true);
  }

  function openEditDialog(item: MenuItem) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      tags: item.tags ?? [],
    });
    setDialogOpen(true);
  }

  function toggleTag(tag: string) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleSave() {
    const name = form.name.trim();
    const price = form.price.trim();
    const description = form.description.trim();
    if (!name || !price || !description) return;

    if (editingId) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name,
                category: form.category,
                price,
                description,
                tags: form.tags.length ? form.tags : undefined,
                image: { alt: name },
              }
            : item,
        ),
      );
    } else {
      const baseId = slugify(name) || `item-${Date.now()}`;
      let id = baseId;
      let suffix = 2;
      while (items.some((item) => item.id === id)) {
        id = `${baseId}-${suffix}`;
        suffix += 1;
      }
      setItems((prev) => [
        ...prev,
        {
          id,
          name,
          category: form.category,
          price,
          description,
          tags: form.tags.length ? form.tags : undefined,
          image: { alt: name },
        },
      ]);
    }

    setDialogOpen(false);
  }

  const isValid =
    form.name.trim() !== "" &&
    form.price.trim() !== "" &&
    form.description.trim() !== "";

  return (
    <div>
      {/* Filters + add */}
      <Reveal className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon
              icon={Search01Icon}
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-boxx-dim"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dishes and drinks…"
              aria-label="Search menu items"
              className="w-full rounded-full border border-boxx-line bg-boxx-coal py-2.5 pl-11 pr-4 text-sm text-boxx-white placeholder:text-boxx-dim outline-none transition-colors duration-200 focus:border-boxx-red focus-visible:ring-[3px] focus-visible:ring-ring"
            />
          </div>

          <Select
            value={category}
            onValueChange={(v) => setCategory(v as MenuCategory | "All")}
          >
            <SelectTrigger className="w-full rounded-full border-boxx-line bg-boxx-coal px-4 text-sm sm:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All categories</SelectItem>
              {menuCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={openAddDialog} className="shrink-0">
          <HugeiconsIcon icon={Add01Icon} className="size-4" />
          Add item
        </Button>
      </Reveal>

      {/* Table */}
      <Reveal
        delay={100}
        className="mt-6 rounded-2xl border border-boxx-line bg-boxx-coal"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-boxx-line text-[10px] font-bold uppercase tracking-widest text-boxx-dim">
                <th className="px-6 py-4 font-bold">Item</th>
                <th className="px-4 py-4 font-bold">Category</th>
                <th className="px-4 py-4 font-bold">Price</th>
                <th className="px-4 py-4 font-bold">Tags</th>
                <th className="px-6 py-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-boxx-line/50 last:border-0"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-boxx-white">
                      {item.name}
                    </p>
                    <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-boxx-dim">
                      {item.description}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-boxx-mist">
                    {item.category}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-boxx-mist">
                    {item.price}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(item.tags ?? []).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditDialog(item)}
                        aria-label={`Edit ${item.name}`}
                        className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-white"
                      >
                        <HugeiconsIcon
                          icon={PencilEdit01Icon}
                          className="size-3.5"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Delete ${item.name}`}
                        className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-boxx-line text-boxx-dim transition-colors duration-200 hover:border-boxx-red hover:text-boxx-red"
                      >
                        <HugeiconsIcon
                          icon={Delete02Icon}
                          className="size-3.5"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-14 text-center text-sm text-boxx-dim"
                  >
                    No menu items match this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Reveal>
      <p className="mt-3 text-xs tracking-[0.2em] text-boxx-dim uppercase">
        {filtered.length} {filtered.length === 1 ? "item" : "items"}
      </p>

      {/* Add / edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <div className="p-6">
            <DialogHeader className="gap-1.5 p-0">
              <DialogTitle>{editingId ? "Edit item" : "Add item"}</DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update this dish or drink's details."
                  : "New items appear on the public menu instantly — the image stays a branded placeholder until real photography is added."}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-5">
              <div className="space-y-2">
                <FieldLabel>Name</FieldLabel>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Suya Platter"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel>Category</FieldLabel>
                  <Select
                    value={form.category}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, category: v as MenuCategory }))
                    }
                  >
                    <SelectTrigger className="w-full rounded-xl border-boxx-line bg-boxx-night px-4 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {menuCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <FieldLabel>Price</FieldLabel>
                  <Input
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    placeholder="₦0,000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <FieldLabel>Description</FieldLabel>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  placeholder="A short, tasty description for the menu card."
                  className={cn(fieldClass, "resize-y")}
                />
              </div>

              <div className="space-y-2">
                <FieldLabel>Tags</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      aria-pressed={form.tags.includes(tag)}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase transition-colors duration-200",
                        form.tags.includes(tag)
                          ? "border-boxx-red bg-boxx-red text-boxx-white"
                          : "border-boxx-line text-boxx-mist hover:border-boxx-dim hover:text-boxx-white",
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-8 p-0">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!isValid}>
                {editingId ? "Save changes" : "Add item"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
