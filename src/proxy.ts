import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseProductRouteId } from "@/lib/data/products";

// 👀 "Recently viewed" — a per-browser cookie, not per-account: no
// server-side data to leak. Written here because only a Proxy/Route
// Handler may set cookies, and Proxy runs on every page view for free.
const COOKIE_NAME = "mk_recent";
const MAX_ITEMS = 10;
const MAX_AGE = 60 * 60 * 24 * 180; // ~6 months

function readIds(request: NextRequest): number[] {
  const raw = request.cookies.get(COOKIE_NAME)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n): n is number => typeof n === "number");
  } catch {
    return [];
  }
}

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-malli-pathname", request.nextUrl.pathname);

  const match = /^\/product\/([^/]+)/.exec(request.nextUrl.pathname);
  const id = match ? parseProductRouteId(match[1]) : Number.NaN;
  const isPrefetch =
    request.headers.has("next-router-prefetch") ||
    request.headers.get("purpose") === "prefetch";

  if (!Number.isFinite(id) || isPrefetch) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const existing = readIds(request);
  const next = [id, ...existing.filter((viewed) => viewed !== id)].slice(
    0,
    MAX_ITEMS,
  );

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.set(COOKIE_NAME, JSON.stringify(next), {
    maxAge: MAX_AGE,
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|fonts/).*)"],
};
