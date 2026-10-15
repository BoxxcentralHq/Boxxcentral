"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  CinemaSettings,
  UpdateCinemaSettingsBody,
} from "@/lib/api/types";

export const CINEMA_SETTINGS_KEY = ["cinema", "settings"] as const;

export function useCinemaSettings() {
  return useQuery({
    queryKey: CINEMA_SETTINGS_KEY,
    queryFn: () => api.get<CinemaSettings>("/cinema/settings"),
    staleTime: 5 * 60_000,
  });
}

export function useUpdateCinemaSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateCinemaSettingsBody) =>
      api.patch<CinemaSettings>("/cinema/settings", body),
    onSuccess: (data) => queryClient.setQueryData(CINEMA_SETTINGS_KEY, data),
  });
}
