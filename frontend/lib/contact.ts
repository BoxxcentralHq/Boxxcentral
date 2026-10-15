"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  ContactMessage,
  CreateContactMessageBody,
  MessagesPage,
} from "@/lib/api/types";

export function useCreateContactMessage() {
  return useMutation({
    mutationFn: (body: CreateContactMessageBody) =>
      api.post<void>("/contact", body),
  });
}

const ADMIN_MESSAGES_KEY = ["admin", "messages"] as const;

export type MessagesQuery = {
  page?: number;
  limit?: number;
  unread?: boolean;
};

export function useMessagesList(query: MessagesQuery, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...ADMIN_MESSAGES_KEY, query] as const,
    queryFn: () => api.get<MessagesPage>("/contact", query),
    enabled: options?.enabled,
  });
}

export function useMarkMessageRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<ContactMessage>(`/contact/${id}/read`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_MESSAGES_KEY }),
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/contact/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_MESSAGES_KEY }),
  });
}
