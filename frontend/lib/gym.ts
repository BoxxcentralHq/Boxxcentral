"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  CreateGymSubscriptionBody,
  CreateGymSubscriptionResponse,
  GymPlan,
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
