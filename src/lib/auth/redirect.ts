export const AUTH_ROUTE = "/login";

/** Keep post-auth navigation same-origin and avoid redirecting back into /login. */
export function safeAuthReturnPath(value: unknown): string {
  if (typeof value !== "string" || !value) return "/";
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value === AUTH_ROUTE ||
    value.startsWith(`${AUTH_ROUTE}?`) ||
    value.startsWith(`${AUTH_ROUTE}#`)
  ) {
    return "/";
  }
  return value;
}

export function authHref(next = "/") {
  return `${AUTH_ROUTE}?next=${encodeURIComponent(safeAuthReturnPath(next))}`;
}

/** Called only from client event handlers that are already running in a browser. */
export function currentPathWithSearch() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}
