import axios from "axios";
import { API_URL } from "../core";

// single-flight: concurrent 401s share one refresh call — the backend
// treats refresh-token reuse as theft and kills the session
let refreshInFlight: Promise<boolean> | null = null;

export function refreshSession(): Promise<boolean> {
  refreshInFlight ??= axios
    .post(`${API_URL}/admin/refresh`, undefined, { withCredentials: true })
    .then(() => true)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

export function redirectToLogin() {
  if (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/admin")
  ) {
    window.location.assign("/login");
  }
}
