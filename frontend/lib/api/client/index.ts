"use client";

import { Query, ApiError } from "../core";
import { http } from "./http";

export const api = {
  get: <T>(path: string, query?: Query) =>
    http.get<T>(path, { params: query }).then((r) => r.data),

  post: <T>(path: string, body?: unknown) =>
    http.post<T>(path, body).then((r) => r.data),

  patch: <T>(path: string, body?: unknown) =>
    http.patch<T>(path, body).then((r) => r.data),

  del: <T>(path: string) => http.delete<T>(path).then((r) => r.data),

  // axios detects FormData and sets the multipart boundary itself
  postForm: <T>(path: string, form: FormData) =>
    http.post<T>(path, form).then((r) => r.data),

  patchForm: <T>(path: string, form: FormData) =>
    http.patch<T>(path, form).then((r) => r.data),
};

export { ApiError };
