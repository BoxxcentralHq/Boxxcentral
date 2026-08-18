"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  CreateGymPlanBody,
  CreateGymSubscriptionBody,
  CreateGymSubscriptionResponse,
  GymPlan,
  GymSubscription,
  GymSubscriptionsPage,
  GymSubscriptionStatus,
  UpdateGymPlanBody,
} from "@/lib/api/types";

/** Visible plans only — the GymBoxx membership carousel. */
export function useGymPlans() {
  return useQuery({
    queryKey: ["gym", "plans"] as const,
    queryFn: () => api.get<GymPlan[]>("/gym/plans"),
    staleTime: 60_000,
  });
}

/** Creates the subscription and returns the Flutterwave link to redirect the member to. */
export function useCreateGymSubscription() {
  return useMutation({
    mutationFn: (body: CreateGymSubscriptionBody) =>
      api.post<CreateGymSubscriptionResponse>("/gym/subscriptions", body),
  });
}

const ADMIN_GYM_PLANS_KEY = ["admin", "gym", "plans"] as const;

/** super_admin / gym_admin — full plan list, including hidden ones. */
export function useGymPlansAdmin() {
  return useQuery({
    queryKey: ADMIN_GYM_PLANS_KEY,
    queryFn: () => api.get<GymPlan[]>("/gym/plans/all"),
  });
}

export function useCreateGymPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateGymPlanBody) =>
      api.post<GymPlan>("/gym/plans", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_GYM_PLANS_KEY }),
  });
}

export function useUpdateGymPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateGymPlanBody }) =>
      api.patch<GymPlan>(`/gym/plans/${id}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_GYM_PLANS_KEY }),
  });
}

export function useDeleteGymPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/gym/plans/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_GYM_PLANS_KEY }),
  });
}

export type GymSubscriptionsQuery = {
  page?: number;
  limit?: number;
  status?: GymSubscriptionStatus;
};

const ADMIN_GYM_SUBSCRIPTIONS_KEY = ["admin", "gym", "subscriptions"] as const;

/** super_admin / gym_admin — paginated membership list, browsed by status tab. */
export function useGymSubscriptions(query: GymSubscriptionsQuery) {
  return useQuery({
    queryKey: [...ADMIN_GYM_SUBSCRIPTIONS_KEY, query] as const,
    queryFn: () => api.get<GymSubscriptionsPage>("/gym/subscriptions", query),
  });
}

/** Front-desk lookup by name/email/phone/reference — server-side, up to 25 matches. */
export function useSearchGymSubscriptions(query: string) {
  return useQuery({
    queryKey: [...ADMIN_GYM_SUBSCRIPTIONS_KEY, "search", query] as const,
    queryFn: () =>
      api.get<GymSubscription[]>("/gym/subscriptions/search", { query }),
    enabled: query.trim().length > 0,
  });
}

/** Front desk confirms the member is here — starts the pass counting down. */
export function useActivateGymSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<GymSubscription>(`/gym/subscriptions/${id}/activate`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_GYM_SUBSCRIPTIONS_KEY }),
  });
}
