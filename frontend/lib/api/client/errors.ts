import { AxiosError } from "axios";
import { ApiError } from "../core";

// normalizes any axios failure (HTTP or network) into our typed ApiError
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  const err = error as AxiosError;
  const status = err.response?.status ?? 0;
  const data = err.response?.data;

  let message = status ? `Request failed (${status})` : "Network error";
  if (data && typeof data === "object" && "message" in data) {
    const m = (data as { message: string | string[] }).message;
    message = Array.isArray(m) ? m.join(". ") : m;
  }
  return new ApiError(status, message);
}
