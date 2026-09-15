import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseProductRouteId } from "@/lib/data/products";

// Keep recent products in a browser cookie, separate from account data.
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
  const match = /^\/product\/([^/]+)/.exec(request.nextUrl.pathname);
  const id = match ? parseProductRouteId(match[1]) : Number.NaN;
  const isPrefetch =
    request.headers.has("next-router-prefetch") ||
    request.headers.get("purpose") === "prefetch";

  if (!Number.isFinite(id) || isPrefetch) {
    return NextResponse.next();
  }

  const existing = readIds(request);
  const next = [id, ...existing.filter((viewed) => viewed !== id)].slice(
    0,
    MAX_ITEMS,
  );

  const response = NextResponse.next();
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
