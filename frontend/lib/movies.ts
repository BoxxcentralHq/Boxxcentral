"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Movie } from "@/lib/api/types";

const ADMIN_MOVIES_KEY = ["admin", "movies"] as const;

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

export function useCreateMovie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<MovieInput, "visible">) =>
      api.postForm<Movie>("/cinema/movies", toMovieFormData(input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_MOVIES_KEY }),
  });
}

export function useUpdateMovie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<MovieInput> }) =>
      api.patchForm<Movie>(`/cinema/movies/${id}`, toMovieFormData(input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_MOVIES_KEY }),
  });
}

export function useDeleteMovie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/cinema/movies/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_MOVIES_KEY }),
  });
}
