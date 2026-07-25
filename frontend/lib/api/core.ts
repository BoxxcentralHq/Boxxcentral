export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type Query = Record<string, string | number | boolean | undefined>;

export function buildUrl(path: string, query?: Query): string {
  const url = `${API_URL}${path}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

// NestJS error bodies: { message: string | string[], statusCode, error }
export async function parseResponse<T>(res: Response): Promise<T> {
  const isJson = res.headers
    .get("content-type")
    ?.includes("application/json");
  const body: unknown = isJson ? await res.json() : undefined;

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    if (body && typeof body === "object" && "message" in body) {
      const m = (body as { message: string | string[] }).message;
      message = Array.isArray(m) ? m.join(". ") : m;
    }
    throw new ApiError(res.status, message);
  }

  return body as T;
}

