import { STORAGE } from "@/lib/constants";
import type { FestiveBanner as BannerItem, User } from "@/types";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export type StoredCartItem = { id: number; size: string; qty: number };
export type StoredCampaign = { active: boolean; percent: number; title: string };

export type StoreBootstrap = {
  user: User | null;
  cart: StoredCartItem[];
  campaign: StoredCampaign;
  banner: BannerItem | null;
  ready: boolean;
};

export const THEME_KEY = STORAGE.theme;
export const THEME_RESOLVED_KEY = STORAGE.themeResolved;
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

function parseJson<T>(value: string | undefined, fallback: T) {
  const raw = decode(value);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readThemePreference(value?: string): ThemePreference {
  const theme = decode(value);
  return theme === "light" || theme === "dark" || theme === "system"
    ? theme
    : "system";
}

export function readResolvedTheme(value?: string): ResolvedTheme | null {
  const theme = decode(value);
  return theme === "light" || theme === "dark" ? theme : null;
}

export function resolveThemePreference(
  theme: ThemePreference,
  systemDark: boolean,
): ResolvedTheme {
  if (theme === "system") return systemDark ? "dark" : "light";
  return theme;
}

export function resolveInitialTheme(
  theme: ThemePreference,
  resolved: ResolvedTheme | null,
) {
  if (theme === "light" || theme === "dark") return theme;
  return resolved ?? "light";
}

export function sanitizeUser(value: unknown): User | null {
  if (!value || typeof value !== "object") return null;

  const user = value as Record<string, unknown>;
  const firstName = typeof user.firstName === "string" ? user.firstName.trim() : "";
  const email = typeof user.email === "string" ? user.email.trim() : "";

  if (!firstName || !email) return null;

  return {
    firstName,
    email,
    lastName: typeof user.lastName === "string" ? user.lastName.trim() : undefined,
    phone: typeof user.phone === "string" ? user.phone.trim() : undefined,
    avatar: typeof user.avatar === "string" ? user.avatar.trim() : undefined,
    nationalId:
      typeof user.nationalId === "string" ? user.nationalId.trim() : undefined,
    city: typeof user.city === "string" ? user.city.trim() : undefined,
    address: typeof user.address === "string" ? user.address.trim() : undefined,
    childName: typeof user.childName === "string" ? user.childName.trim() : undefined,
    childAge: typeof user.childAge === "string" ? user.childAge.trim() : undefined,
    childGender:
      typeof user.childGender === "string" ? user.childGender.trim() : undefined,
  };
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
    coupon: typeof banner.coupon === "string" ? banner.coupon.trim() : undefined,
    theme,
    from: banner.from.trim(),
    to: banner.to.trim(),
    active: Boolean(banner.active),
    pinned: Boolean(banner.pinned),
  };
}

export function readStoreBootstrap(getCookie: (name: string) => string | undefined) {
  const userCookie = getCookie(STORAGE.user);
  const cartCookie = getCookie(STORAGE.cart);
  const campaignCookie = getCookie(STORAGE.campaign);
  const bannerCookie = getCookie(STORAGE.banner);
  const bootCookie = getCookie(STORAGE.boot);

  return {
    user: sanitizeUser(parseJson(userCookie, null)),
    cart: sanitizeCart(parseJson(cartCookie, [])),
    campaign: sanitizeCampaign(parseJson(campaignCookie, NO_CAMPAIGN)),
    banner: sanitizeBanner(parseJson(bannerCookie, null)),
    ready:
      bootCookie === "1" ||
      Boolean(userCookie || cartCookie || campaignCookie || bannerCookie),
  } satisfies StoreBootstrap;
}

export function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_AGE}; samesite=lax`;
}

export function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

export function writeJsonCookie(name: string, value: unknown) {
  writeCookie(name, encodeURIComponent(JSON.stringify(value)));
}

export function buildThemeScript() {
  return `(() => {
    const themeKey = ${JSON.stringify(THEME_KEY)};
    const resolvedKey = ${JSON.stringify(THEME_RESOLVED_KEY)};
    const userKey = ${JSON.stringify(STORAGE.user)};
    const readCookie = (key) => {
      const hit = document.cookie
        .split('; ')
        .find((part) => part.startsWith(key + '='));
      return hit ? decodeURIComponent(hit.slice(key.length + 1)) : '';
    };

    try {
      const saved = localStorage.getItem(themeKey) || readCookie(themeKey) || 'system';
      const theme = saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
      const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      const resolved = dark ? 'dark' : 'light';
      const root = document.documentElement;
      root.classList.toggle('dark', dark);
      root.style.colorScheme = resolved;
      root.dataset.auth = localStorage.getItem(userKey) || readCookie(userKey) ? 'user' : 'guest';
      document.cookie = themeKey + '=' + encodeURIComponent(theme) + '; path=/; max-age=${COOKIE_AGE}; samesite=lax';
      document.cookie = resolvedKey + '=' + resolved + '; path=/; max-age=${COOKIE_AGE}; samesite=lax';
    } catch {
      document.documentElement.dataset.auth = 'guest';
    }
  })();`;
}
