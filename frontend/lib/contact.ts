"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  ContactMessage,
  CreateContactMessageBody,
  MessagesPage,
} from "@/lib/api/types";

/** Public — submits the contact form. Server rate-limits this to 3/min. */
export function useCreateContactMessage() {
  return useMutation({
    mutationFn: (body: CreateContactMessageBody) =>
      api.post<ContactMessage>("/contact", body),
  });
}

const ADMIN_MESSAGES_KEY = ["admin", "messages"] as const;

export type MessagesQuery = {
  page?: number;
  limit?: number;
  unread?: boolean;
};

/** super_admin-only paginated inbox. */
export function useMessagesList(query: MessagesQuery) {
  return useQuery({
    queryKey: [...ADMIN_MESSAGES_KEY, query] as const,
    queryFn: () => api.get<MessagesPage>("/contact", query),
  });
}

/** Marks a message read. */
export function useMarkMessageRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<ContactMessage>(`/contact/${id}/read`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_MESSAGES_KEY }),
  });
}

/** Permanently deletes a message. */
export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/contact/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_MESSAGES_KEY }),
  });
}
