/**
 * API base URL helpers.
 *
 * In development (no VITE_API_URL), `/api/*` requests use same-origin paths so
 * Vite can proxy them to the Express server. That way DevTools shows a distinct
 * XHR/fetch named `api/products` with a JSON body — not the `/products` page document.
 *
 * Non-API backend routes (e.g. `/login`, `/seller/discounts`) always use BACKEND_ORIGIN
 * so they do not collide with React Router paths on the dev server.
 */
function trimTrailingSlash(s: string): string {
  return s.replace(/\/$/, "");
}

const envRaw = import.meta.env.VITE_API_URL as string | undefined;
const envBase =
  typeof envRaw === "string" && envRaw.trim().length > 0
    ? trimTrailingSlash(envRaw.trim())
    : "";

export const BACKEND_ORIGIN = envBase || "http://localhost:5000";

const useDevApiProxy = import.meta.env.DEV && !envBase;

/** Paths must start with `/api` (e.g. `/api/products`). */
export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (useDevApiProxy) return p;
  return `${BACKEND_ORIGIN}${p}`;
}

/** Backend routes outside `/api` (auth, seller discounts, dashboard, profile). */
export function backendUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_ORIGIN}${p}`;
}
