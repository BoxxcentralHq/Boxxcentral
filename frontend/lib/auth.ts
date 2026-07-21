"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import type { LoginResponse, Profile } from "@/lib/api/types";

export const PROFILE_KEY = ["admin", "profile"] as const;

// the auth cookie is httpOnly, so "am I signed in?" is always a server question
export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => api.get<Profile>("/admin/profile"),
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      api.post<LoginResponse>("/admin/login", credentials),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => api.post("/admin/logout"),
    // even if the call fails the session is unusable — always leave
    onSettled: () => {
      queryClient.clear();
      router.replace("/login");
    },
  });
}
