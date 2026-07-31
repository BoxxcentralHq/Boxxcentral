"use client";

// Public menu reads go through lib/api/server.ts's getMenuItems() (a plain
// server-component fetch) — this file is the admin-only CRUD surface.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { MenuCategory, MenuItem } from "@/lib/api/types";

const ADMIN_MENU_KEY = ["admin", "menu"] as const;

/** super_admin / lounge_admin — full list, including hidden items. */
export function useMenuItemsAdmin(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ADMIN_MENU_KEY,
    queryFn: () => api.get<MenuItem[]>("/menu/all"),
    enabled: options?.enabled,
  });
}

export type MenuItemInput = {
  name: string;
  category: MenuCategory;
  price: number;
  description: string;
  imageAlt?: string;
  tags?: string[];
  image?: File;
  visible?: boolean;
};

/** tags travels as a comma-separated string on the wire, not a JSON array. */
function toMenuFormData(input: Partial<MenuItemInput>): FormData {
  const form = new FormData();
  if (input.name !== undefined) form.set("name", input.name);
  if (input.category !== undefined) form.set("category", input.category);
  if (input.price !== undefined) form.set("price", String(input.price));
  if (input.description !== undefined) form.set("description", input.description);
  if (input.imageAlt !== undefined) form.set("imageAlt", input.imageAlt);
  if (input.tags !== undefined) form.set("tags", input.tags.join(", "));
  if (input.visible !== undefined) form.set("visible", String(input.visible));
  if (input.image) form.set("image", input.image);
  return form;
}

/** Creates a menu item. Multipart — image is required on create. */
export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MenuItemInput) =>
      api.postForm<MenuItem>("/menu", toMenuFormData(input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_MENU_KEY }),
  });
}

/** Updates a menu item. All fields optional — only send what changed. */
export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<MenuItemInput> }) =>
      api.patchForm<MenuItem>(`/menu/${id}`, toMenuFormData(input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_MENU_KEY }),
  });
}

/** Permanently deletes a menu item. */
export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/menu/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_MENU_KEY }),
  });
}
