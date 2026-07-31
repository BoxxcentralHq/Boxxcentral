"use client";

// Public movie reads go through lib/api/server.ts's getMovies() (a plain
// server-component fetch) — this file is the admin-only CRUD surface.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Movie } from "@/lib/api/types";

const ADMIN_MOVIES_KEY = ["admin", "movies"] as const;

/** super_admin / cinema_admin — full list, including hidden movies. */
export function useMoviesAdmin() {
  return useQuery({
    queryKey: ADMIN_MOVIES_KEY,
    queryFn: () => api.get<Movie[]>("/cinema/movies/all"),
  });
}

export type MovieInput = {
  title: string;
  synopsis?: string;
  genre?: string;
  durationMins?: number;
  poster?: File;
  /** PATCH-only per the API — never sent on create. */
  visible?: boolean;
};

function toMovieFormData(input: Partial<MovieInput>): FormData {
  const form = new FormData();
  if (input.title !== undefined) form.set("title", input.title);
  if (input.synopsis !== undefined) form.set("synopsis", input.synopsis);
  if (input.genre !== undefined) form.set("genre", input.genre);
  if (input.durationMins !== undefined) form.set("durationMins", String(input.durationMins));
  if (input.visible !== undefined) form.set("visible", String(input.visible));
  if (input.poster) form.set("poster", input.poster);
  return form;
}

/** Creates a movie. Multipart — file field is `poster`. */
export function useCreateMovie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<MovieInput, "visible">) =>
      api.postForm<Movie>("/cinema/movies", toMovieFormData(input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_MOVIES_KEY }),
  });
}

/** Updates a movie. All fields optional — only send what changed. */
export function useUpdateMovie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<MovieInput> }) =>
      api.patchForm<Movie>(`/cinema/movies/${id}`, toMovieFormData(input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_MOVIES_KEY }),
  });
}

/** Permanently deletes a movie. */
export function useDeleteMovie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/cinema/movies/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_MOVIES_KEY }),
  });
}
