"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  MonthlyRevenue,
  Payment,
  PaymentsPage,
  PaymentVerification,
} from "@/lib/api/types";

/** Public — the post-payment redirect page polls this until the gateway settles. */
export function usePaymentVerify(idOrRef: string | undefined) {
  return useQuery({
    queryKey: ["payments", "verify", idOrRef] as const,
    queryFn: () => api.get<PaymentVerification>(`/payments/${idOrRef}/verify`),
    enabled: Boolean(idOrRef),
    refetchInterval: (query) =>
      query.state.data?.gatewayStatus === "pending" ? 3000 : false,
  });
}

export type PaymentsQuery = {
  page?: number;
  limit?: number;
  search?: string;
};

const ADMIN_PAYMENTS_KEY = ["admin", "payments"] as const;

/** super_admin only — the payments ledger. */
export function usePaymentsList(query: PaymentsQuery) {
  return useQuery({
    queryKey: [...ADMIN_PAYMENTS_KEY, query] as const,
    queryFn: () => api.get<PaymentsPage>("/payments", query),
  });
}

/** super_admin only — revenue for the last 6 months, for a dashboard chart. */
export function useMonthlyRevenue() {
  return useQuery({
    queryKey: [...ADMIN_PAYMENTS_KEY, "analytics", "monthly"] as const,
    queryFn: () => api.get<MonthlyRevenue[]>("/payments/analytics/monthly"),
  });
}

/** super_admin only — a single ledger entry with its booking populated. */
export function usePayment(id: string | undefined) {
  return useQuery({
    queryKey: [...ADMIN_PAYMENTS_KEY, id] as const,
    queryFn: () => api.get<Payment>(`/payments/${id}`),
    enabled: Boolean(id),
  });
}
