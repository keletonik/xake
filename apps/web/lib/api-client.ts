import { demoHeaders } from "./demo-mode";

/**
 * Tiny, typed API client. All requests go through the Next.js rewrite
 * (/api/*) so the browser never hits the backend directly, and secrets
 * stay server-side. When demo mode is active, every request carries
 * the `x-xake-demo-id` header so the server scopes state to the
 * isolated demo account.
 */

export class ApiError extends Error {
  constructor(public status: number, message: string, public detail?: unknown) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...demoHeaders(),
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(res.status, data?.error ?? res.statusText, data);
  return data as T;
}

export const api = {
  get: <T>(p: string) => request<T>(p),
  post: <T>(p: string, body?: unknown) => request<T>(p, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(p: string, body?: unknown) => request<T>(p, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(p: string) => request<T>(p, { method: "DELETE" })
};
