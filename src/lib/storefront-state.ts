import { STORAGE } from "@/lib/constants";
import type { FestiveBanner as BannerItem, User } from "@/types";

export type StoredCartItem = { id: number; size: string; qty: number };
export type StoredCampaign = {
  active: boolean;
  percent: number;
  title: string;
};

export type StoreBootstrap = {
  cart: StoredCartItem[];
  campaign: StoredCampaign;
  banner: BannerItem | null;
};

const COOKIE_AGE = 60 * 60 * 24 * 180;
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

// Keeps an optional cookie/JSON field only if it's a trimmed string.
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

// Keyed by email — accounts never inherit each other's cart; "guest" is its own slot
export function cartScopeOf(user: Pick<User, "email"> | null): string {
  return user?.email ? user.email.trim().toLowerCase() : "guest";
}

export function cartStorageKey(scope: string): string {
  return `${STORAGE.cart}:${scope}`;
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

function sanitizeCampaign(value: unknown): StoredCampaign {
  if (!value || typeof value !== "object") return NO_CAMPAIGN;

  const campaign = value as Record<string, unknown>;
  const percent = typeof campaign.percent === "number" ? campaign.percent : 0;

  return {
    active: Boolean(campaign.active) && percent > 0,
    percent: Math.min(90, Math.max(0, Math.round(percent))),
    title: typeof campaign.title === "string" ? campaign.title.trim() : "",
  };
}

function sanitizeBanner(value: unknown): BannerItem | null {
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

// Server-fetched values from the caller; only cart bootstraps from its cookie
export function readStoreBootstrap(
  getCookie: (name: string) => string | undefined,
  user: User | null,
  campaign: StoredCampaign,
  banner: BannerItem | null,
): StoreBootstrap {
  const cartCookie = getCookie(cartStorageKey(cartScopeOf(user)));

  return {
    cart: sanitizeCart(parseJson(cartCookie, [])),
    campaign: sanitizeCampaign(campaign),
    banner: sanitizeBanner(banner),
  };
}

export function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_AGE}; samesite=lax`;
}

export function writeJsonCookie(name: string, value: unknown) {
  writeCookie(name, encodeURIComponent(JSON.stringify(value)));
}
