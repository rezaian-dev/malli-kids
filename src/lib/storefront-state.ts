import { STORAGE } from "@/lib/constants";
import type { FestiveBanner as BannerItem, User } from "@/types";

export type StoredCartItem = { id: number; size: string; qty: number };
export type StoredCampaign = {
  active: boolean;
  percent: number;
  title: string;
};

export type StoreBootstrap = {
  user: User | null;
  cart: StoredCartItem[];
  campaign: StoredCampaign;
  banner: BannerItem | null;
  ready: boolean;
};

export const COOKIE_AGE = 60 * 60 * 24 * 180;
export const NO_CAMPAIGN: StoredCampaign = {
  active: false,
  percent: 0,
  title: "",
};

function decode(value?: string) {
  if (!value) return "";

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// 🍪 An optional field from cookie/localStorage JSON: keep it only if it's
// actually a (trimmed) string — used by every sanitize* below.
function str(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined;
}

function parseJson<T>(value: string | undefined, fallback: T) {
  const raw = decode(value);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function sanitizeCart(value: unknown): StoredCartItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const row = item as Record<string, unknown>;
    const id = typeof row.id === "number" ? row.id : NaN;
    const size = typeof row.size === "string" ? row.size.trim() : "";
    const qty = typeof row.qty === "number" ? row.qty : NaN;

    if (!Number.isFinite(id) || !size || !Number.isFinite(qty)) return [];

    return [
      {
        id,
        size,
        qty: Math.min(9, Math.max(1, Math.round(qty))),
      },
    ];
  });
}

export function sanitizeCampaign(value: unknown): StoredCampaign {
  if (!value || typeof value !== "object") return NO_CAMPAIGN;

  const campaign = value as Record<string, unknown>;
  const percent = typeof campaign.percent === "number" ? campaign.percent : 0;

  return {
    active: Boolean(campaign.active) && percent > 0,
    percent: Math.min(90, Math.max(0, Math.round(percent))),
    title: typeof campaign.title === "string" ? campaign.title.trim() : "",
  };
}

export function sanitizeBanner(value: unknown): BannerItem | null {
  if (!value || typeof value !== "object") return null;

  const banner = value as Record<string, unknown>;
  const theme = banner.theme;

  if (
    typeof banner.id !== "string" ||
    typeof banner.occasion !== "string" ||
    typeof banner.title !== "string" ||
    typeof banner.subtitle !== "string" ||
    typeof banner.cta !== "string" ||
    typeof banner.href !== "string" ||
    typeof banner.from !== "string" ||
    typeof banner.to !== "string" ||
    (theme !== "navy" && theme !== "gold" && theme !== "night")
  ) {
    return null;
  }

  return {
    id: banner.id.trim(),
    occasion: banner.occasion.trim(),
    title: banner.title.trim(),
    subtitle: banner.subtitle.trim(),
    cta: banner.cta.trim(),
    href: banner.href.trim(),
    coupon: str(banner.coupon),
    theme,
    from: banner.from.trim(),
    to: banner.to.trim(),
    active: Boolean(banner.active),
    pinned: Boolean(banner.pinned),
  };
}

// 👤 `user` isn't read from a cookie here — the real session lives in
// Better Auth's httpOnly cookie, only readable server-side via
// `getSessionUser()`. Likewise `campaign`/`banner` are real, freshly-read
// DB values (`@/lib/shop/settings`, `@/lib/shop/banners`) computed on every
// request — the caller (`app/layout.tsx`) passes all three in directly
// instead of this module trying to resync them from a client-side source.
// `cart` is the one genuinely client-only piece (no backend), so it's still
// bootstrapped from its cookie.
export function readStoreBootstrap(
  getCookie: (name: string) => string | undefined,
  user: User | null,
  campaign: StoredCampaign,
  banner: BannerItem | null,
) {
  const cartCookie = getCookie(STORAGE.cart);
  const bootCookie = getCookie(STORAGE.boot);

  return {
    user,
    cart: sanitizeCart(parseJson(cartCookie, [])),
    campaign: sanitizeCampaign(campaign),
    banner: sanitizeBanner(banner),
    ready: bootCookie === "1" || Boolean(cartCookie),
  } satisfies StoreBootstrap;
}

export function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_AGE}; samesite=lax`;
}

export function writeJsonCookie(name: string, value: unknown) {
  writeCookie(name, encodeURIComponent(JSON.stringify(value)));
}
