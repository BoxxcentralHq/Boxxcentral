"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import type {
  Admin,
  ChangePasswordBody,
  CreateAdminBody,
  LoginResponse,
  Profile,
} from "@/lib/api/types";

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

/** Any signed-in role can change their own password. */
export function useChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordBody) =>
      api.patch<void>("/admin/change-password", body),
  });
}

const ADMINS_KEY = ["admin", "admins"] as const;

/** super_admin only — every staff account. */
export function useAdmins() {
  return useQuery({
    queryKey: ADMINS_KEY,
    queryFn: () => api.get<Admin[]>("/admin/admins"),
  });
}

/** super_admin only — creates a cinema_admin or lounge_admin account. */
export function useCreateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAdminBody) => api.post<Admin>("/admin/admins", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMINS_KEY }),
  });
}

/** super_admin only — the API itself blocks deleting yourself or the super admin. */
export function useDeleteAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/admin/admins/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMINS_KEY }),
  });
}
