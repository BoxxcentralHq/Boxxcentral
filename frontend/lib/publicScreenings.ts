"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  CreateTicketOrderBody,
  CreateTicketOrderResponse,
} from "@/lib/api/types";

export function useBuyTickets() {
  return useMutation({
    mutationFn: ({
      screeningId,
      body,
    }: {
      screeningId: string;
      body: CreateTicketOrderBody;
    }) =>
      api.post<CreateTicketOrderResponse>(
        `/screenings/${screeningId}/tickets`,
        body,
      ),
  });
}
