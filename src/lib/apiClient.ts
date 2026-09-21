import { useAuthStore } from "@/store/authStore";

const BASE_URL = "http://localhost:8080/api";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  /** Skip attaching the Authorization header (login/register/refresh calls). */
  skipAuth?: boolean;
}

/**
 * Minimal fetch wrapper used by all TanStack Query hooks.
 *
 * Auth model: the access token lives in memory only (Zustand store), never
 * localStorage, to limit XSS blast radius. A refresh flow can be wired in
 * `handleUnauthorized` once the backend's refresh endpoint is finalized —
 * see the note in the auth store for the httpOnly-cookie vs localStorage
 * discussion called out in the project brief.
 */
async function request<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { method = "GET", body, headers = {}, skipAuth = false } = options;

  const accessToken = useAuthStore.getState().accessToken;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (!skipAuth && accessToken) {
    finalHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && !skipAuth) {
    handleUnauthorized();
  }

  if (!response.ok) {
    let parsedBody: unknown = null;
    try {
      parsedBody = await response.json();
    } catch {
      // no JSON body — that's fine
    }
    throw new ApiError(
      response.status,
      `Request failed: ${method} ${path} (${response.status})`,
      parsedBody,
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

function handleUnauthorized(): void {
  // TODO: attempt a silent refresh against /auth/refresh once the backend
  // contract is confirmed. For now, drop the session so the UI routes the
  // user back to /login via the auth guard.
  useAuthStore.getState().logout();
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "POST", body }),

  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PUT", body }),

  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
