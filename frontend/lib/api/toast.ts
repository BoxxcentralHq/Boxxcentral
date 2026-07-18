"use client";

import { toast } from "sonner";
import { ApiError } from "./core";

export { toast };

export function toastApiError(error: unknown, fallback = "Something went wrong. Please try again.") {
  const message =
    error instanceof ApiError ? error.message : fallback;
  toast.error(message);
}
