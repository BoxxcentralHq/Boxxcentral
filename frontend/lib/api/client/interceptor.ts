import { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { ApiError } from "../core";
import { toApiError } from "./errors";
import { redirectToLogin, refreshSession } from "./session";

// paths where a 401 is a real answer, not an expired access token
const NO_REFRESH_PATHS = ["/admin/login", "/admin/refresh", "/admin/logout"];

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean };

export function attachAuthInterceptor(http: AxiosInstance) {
  http.interceptors.response.use(undefined, async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;

    const shouldRefresh =
      error.response?.status === 401 &&
      config &&
      !config._retry &&
      !NO_REFRESH_PATHS.includes(config.url ?? "");

    if (!shouldRefresh) throw toApiError(error);

    const refreshed = await refreshSession();
    if (!refreshed) {
      redirectToLogin();
      throw new ApiError(401, "Your session has expired. Please log in again.");
    }

    config._retry = true;
    try {
      return await http.request(config);
    } catch (retryError) {
      if ((retryError as AxiosError).response?.status === 401) {
        redirectToLogin();
      }
      throw toApiError(retryError);
    }
  });
}
