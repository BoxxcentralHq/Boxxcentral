"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Delete02Icon,
  ImageAdd01Icon,
  PencilEdit01Icon,
  Search01Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
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
import { toast, toastApiError } from "@/lib/api/toast";
import {
  MENU_CATEGORIES,
  type MenuCategory,
  type MenuItem,
} from "@/lib/api/types";
import {
  useCreateMenuItem,
  useDeleteMenuItem,
  useMenuItemsAdmin,
  useUpdateMenuItem,
} from "@/lib/menu";
import { cn } from "@/lib/utils";
import Pagination from "../../_components/Pagination";

/** The only tags seen in the menu data — kept as toggles rather than free text. */
const availableTags = [
  "Popular",
  "Spicy",
  "Alcoholic",
  "Non-alcoholic",
] as const;

const PAGE_SIZE = 10;
const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

const fieldClass =
  "w-full rounded-xl border border-boxx-line bg-boxx-night px-4 py-3 text-sm text-boxx-white placeholder:text-boxx-dim outline-none transition-colors duration-200 focus:border-boxx-red focus-visible:ring-[3px] focus-visible:ring-ring";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-bold uppercase tracking-[0.2em] text-boxx-dim">
      {children}
    </label>
  );
}

type FormState = {
  name: string;
  category: MenuCategory;
  price: string;
  description: string;
  tags: string[];
  visible: boolean;
  imageFile: File | null;
};

const emptyForm: FormState = {
  name: "",
  category: MENU_CATEGORIES[0],
  price: "",
  description: "",
  tags: [],
  visible: true,
  imageFile: null,
};

/**
 * LoungeBoxx menu's admin surface — add, edit, hide, and remove items
 * against the real /menu API. Images upload as multipart form data.
 */
export default function MenuManager() {
  const { data: items, isLoading, isError } = useMenuItemsAdmin();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<MenuCategory | "All">("All");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MenuItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const list = items ?? [];
    const q = query.trim().toLowerCase();
    return list.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesQuery =
        q === "" ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [items, query, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // revoke the object URL created for a locally-picked file on unmount/replace
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function openAddDialog() {
    setEditingItem(null);
    setForm({
      ...emptyForm,
      category: category === "All" ? MENU_CATEGORIES[0] : category,
    });
    setImagePreview(null);
    setDialogOpen(true);
  }

  function openEditDialog(item: MenuItem) {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      price: String(item.price),
      description: item.description,
      tags: item.tags ?? [],
      visible: item.visible,
      imageFile: null,
    });
    setImagePreview(item.imageUrl ?? null);
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, imageFile: file }));
    setImagePreview(URL.createObjectURL(file));
  }

  function toggleVisible(item: MenuItem) {
    updateItem.mutate(
      { id: item._id, input: { visible: !item.visible } },
      {
        onSuccess: () =>
          toast.success(item.visible ? "Item hidden" : "Item is now visible"),
        onError: (error) => toastApiError(error, "Couldn't update visibility."),
      },
    );
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    deleteItem.mutate(pendingDelete._id, {
      onSuccess: () => {
        toast.success("Item deleted");
        setPendingDelete(null);
      },
      onError: (error) => toastApiError(error, "Couldn't delete that item."),
    });
  }

  const priceValue = Number(form.price);
  const isValid =
    form.name.trim() !== "" &&
    form.description.trim() !== "" &&
    form.price.trim() !== "" &&
    !Number.isNaN(priceValue) &&
    priceValue > 0 &&
    (editingItem !== null || form.imageFile !== null);

  function handleSave() {
    if (!isValid) return;

    const shared = {
      name: form.name.trim(),
      category: form.category,
      price: priceValue,
      description: form.description.trim(),
      tags: form.tags,
      ...(form.imageFile ? { image: form.imageFile } : {}),
    };

    if (editingItem) {
      updateItem.mutate(
        { id: editingItem._id, input: shared },
        {
          onSuccess: () => {
            toast.success("Item updated");
            setDialogOpen(false);
          },
          onError: (error) => toastApiError(error, "Couldn't save changes."),
        },
      );
    } else {
      createItem.mutate(
        { ...shared, image: form.imageFile as File, visible: form.visible },
        {
          onSuccess: () => {
            toast.success("Item added");
            setDialogOpen(false);
          },
          onError: (error) => toastApiError(error, "Couldn't add that item."),
        },
      );
    }
  }

  const saving = createItem.isPending || updateItem.isPending;

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
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search dishes and drinks…"
              aria-label="Search menu items"
              className="w-full rounded-full border border-boxx-line bg-boxx-coal py-2.5 pl-11 pr-4 text-sm text-boxx-white placeholder:text-boxx-dim outline-none transition-colors duration-200 focus:border-boxx-red focus-visible:ring-[3px] focus-visible:ring-ring"
            />
          </div>

          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v as MenuCategory | "All");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full rounded-full border-boxx-line bg-boxx-coal px-4 text-sm sm:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All categories</SelectItem>
              {MENU_CATEGORIES.map((cat) => (
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
                <th className="px-4 py-4 font-bold">Status</th>
                <th className="px-6 py-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-14 text-center text-sm text-boxx-dim"
                  >
                    Loading menu…
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-14 text-center text-sm text-boxx-dim"
                  >
                    Couldn&apos;t load the menu. Try refreshing.
                  </td>
                </tr>
              )}
              {!isLoading &&
                !isError &&
                paginated.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-boxx-line/50 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-boxx-line bg-boxx-night">
                          {item.imageUrl && (
                            <Image
                              src={item.imageUrl}
                              alt={item.imageAlt ?? item.name}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-boxx-white">
                            {item.name}
                          </p>
                          <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-boxx-dim">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-boxx-mist">
                      {item.category}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-boxx-mist">
                      {naira(item.price)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
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
                    <td className="px-4 py-4">
                      <Badge
                        variant={item.visible ? "soft" : "outline"}
                        className="text-[10px]"
                      >
                        {item.visible ? "Visible" : "Hidden"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggleVisible(item)}
                          disabled={
                            updateItem.isPending &&
                            updateItem.variables?.id === item._id
                          }
                          aria-label={
                            item.visible
                              ? `Hide ${item.name}`
                              : `Show ${item.name}`
                          }
                          className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-white disabled:pointer-events-none disabled:opacity-40"
                        >
                          <HugeiconsIcon
                            icon={item.visible ? ViewOffSlashIcon : ViewIcon}
                            className="size-3.5"
                          />
                        </button>
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
                          onClick={() => setPendingDelete(item)}
                          disabled={deleteItem.isPending}
                          aria-label={`Delete ${item.name}`}
                          className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-boxx-line text-boxx-dim transition-colors duration-200 hover:border-boxx-red hover:text-boxx-red disabled:pointer-events-none disabled:opacity-40"
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
              {!isLoading && !isError && filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Search01Icon}
                      title="No menu items match this view"
                      description="Try a different search or category."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          total={filtered.length}
          onPageChange={setPage}
        />
      </Reveal>

      {/* Add / edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <div className="p-6">
            <DialogHeader className="gap-1.5 p-0">
              <DialogTitle>
                {editingItem ? "Edit item" : "Add item"}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Update this dish or drink's details."
                  : "New items appear on the public menu instantly (unless hidden)."}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-5">
              <div className="space-y-2">
                <FieldLabel>Photo</FieldLabel>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-boxx-line bg-boxx-night transition-colors duration-200 hover:border-boxx-red/40"
                >
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt=""
                      fill
                      sizes="450px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex flex-col items-center gap-2 text-boxx-dim">
                      <HugeiconsIcon icon={ImageAdd01Icon} className="size-6" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Upload photo
                      </span>
                    </span>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

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
                      {MENU_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <FieldLabel>Price (₦)</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    step={100}
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    placeholder="6500"
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

              <label className="flex items-center gap-3 text-sm text-boxx-mist">
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, visible: e.target.checked }))
                  }
                  className="size-4 rounded border-boxx-line accent-boxx-red"
                />
                Visible on the public menu
              </label>
            </div>

            <DialogFooter className="mt-8 p-0">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!isValid || saving}>
                {saving ? "Saving…" : editingItem ? "Save changes" : "Add item"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this item?"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" will be removed from the menu for good. This can't be undone.`
            : ""
        }
        pending={deleteItem.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
