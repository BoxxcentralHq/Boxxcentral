"use client";

import { Query, ApiError, ApiEnvelope } from "../core";
import { http } from "./http";

export const api = {
  get: <T>(path: string, query?: Query) =>
    http.get<ApiEnvelope<T>>(path, { params: query }).then((r) => r.data.data),

  post: <T>(path: string, body?: unknown) =>
    http.post<ApiEnvelope<T>>(path, body).then((r) => r.data.data),

  patch: <T>(path: string, body?: unknown) =>
    http.patch<ApiEnvelope<T>>(path, body).then((r) => r.data.data),

  del: <T>(path: string) => http.delete<ApiEnvelope<T>>(path).then((r) => r.data.data),

  // axios detects FormData and sets the multipart boundary itself
  postForm: <T>(path: string, form: FormData) =>
    http.post<ApiEnvelope<T>>(path, form).then((r) => r.data.data),

  patchForm: <T>(path: string, form: FormData) =>
    http.patch<ApiEnvelope<T>>(path, form).then((r) => r.data.data),
};

export { ApiError };
