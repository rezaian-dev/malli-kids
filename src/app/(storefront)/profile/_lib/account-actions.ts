"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { splitName } from "@/lib/auth/user";
import { rateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/action-result";
import type { User } from "@/types";
import {
  ADDRESS_MAX_LEN,
  reverseGeocodeSchema,
  updateAccountSchema,
  type ReverseGeocodeValues,
  type UpdateAccountValues,
} from "./schemas";
import { AUTH_ERROR, FALLBACK_ERROR, requireUserId, upsertProfile } from "./shared";

export async function updateAccountAction(
  values: UpdateAccountValues,
): Promise<ActionResult<Partial<User>>> {
  const parsed = updateAccountSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  const userId = await requireUserId();
  if (!userId) return { ok: false, error: AUTH_ERROR };

  const { name, ...rest } = parsed.data;
  try {
    await auth.api.updateUser({ body: { name }, headers: await headers() });
    await upsertProfile(userId, rest);
    return { ok: true, data: { ...splitName(name), ...rest } };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

// 📐 Biggest → smallest. A level's first present key wins; `essential`
// levels are never dropped for length (state/city/road/house number are
// the whole point of the address), the rest go first when trimming, finest
// (`neighbourhood`) before coarsest (`county`) — see `formatAddress`.
const ADDRESS_LEVELS = [
  { keys: ["state"], essential: true },
  { keys: ["county"], essential: false },
  { keys: ["city", "town", "village"], essential: true },
  { keys: ["city_district", "borough"], essential: false },
  { keys: ["suburb"], essential: false },
  { keys: ["neighbourhood", "quarter"], essential: false },
  { keys: ["road"], essential: true },
  { keys: ["house_number"], essential: true },
] as const satisfies readonly { keys: readonly string[]; essential: boolean }[];

// 🏷️ Nominatim's Iranian data prefixes `state`/`county` with their own
// scope word — "استان تهران" (state), "شهرستان تهران" (county) — while
// `city` for the same point comes back as plain "تهران". Three different
// strings, same place, so a plain `Set` of raw values never catches the
// repeat; stripping this leading word first gets both down to the same
// "تهران" core for comparison (the raw, prefixed value is still what gets
// displayed — only the *comparison* is normalized).
const ADMIN_SCOPE_PREFIX = /^(استان|شهرستان|بخش|دهستان)\s+/;
const addressCore = (value: string) => value.replace(ADMIN_SCOPE_PREFIX, "");

/** 🧭 Nominatim's own `display_name` reads smallest → biggest (street first,
 *  country last), tacks the postal code on as its own segment, and — for a
 *  point inside a capital like Tehran — repeats the same city name once per
 *  administrative level (`state`/`county`/`city` all boil down to "تهران"),
 *  which blew well past the address field's 160-char cap and read like a
 *  stutter. This instead builds the text from the structured `address`
 *  fields (`addressdetails=1`), province → … → house number: a value whose
 *  core name repeats one already used higher up is folded out, and if it's
 *  still too long the most granular optional levels (neighbourhood/suburb/
 *  district) are dropped first, before falling back to a hard cut. */
function formatAddress(
  displayName: string,
  address: Record<string, string> | undefined,
): string {
  if (!address) return displayName.trim();

  const seen = new Set<string>();
  const parts = ADDRESS_LEVELS.map((level) => {
    const value = level.keys.map((k) => address[k]).find(Boolean)?.trim();
    if (!value) return null;
    const core = addressCore(value);
    if (seen.has(core)) return null;
    seen.add(core);
    return { value, essential: level.essential };
  }).filter((p): p is { value: string; essential: boolean } => p !== null);

  const join = (list: typeof parts) => list.map((p) => p.value).join("، ");

  // ✂️ Drop optional parts finest-first (from the tail, since the array is
  // biggest → smallest) until it fits, but never touch the essential ones.
  let trimmed = parts;
  while (join(trimmed).length > ADDRESS_MAX_LEN) {
    const i = trimmed.map((p) => p.essential).lastIndexOf(false);
    if (i === -1) break;
    trimmed = [...trimmed.slice(0, i), ...trimmed.slice(i + 1)];
  }

  const text = join(trimmed);
  return text.length > ADDRESS_MAX_LEN ? text.slice(0, ADDRESS_MAX_LEN) : text;
}

/** 🗺️ Turns a map pin into a text address — called by `AddressMapField`
 *  after the user places/drags the marker or uses GPS. Backed by OSM's free
 *  Nominatim reverse-geocoder: no API key, nothing to configure, unlike the
 *  paid Neshan API this replaced (see git history) — the trade-off is
 *  coarser/less-Persian address text than a paid Iranian provider would give. */
export async function reverseGeocodeAction(
  values: ReverseGeocodeValues,
): Promise<ActionResult<{ address: string }>> {
  const parsed = reverseGeocodeSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "مختصات نامعتبر است." };

  const userId = await requireUserId();
  if (!userId) return { ok: false, error: AUTH_ERROR };

  // 🚦 Nominatim's usage policy caps free reverse-geocoding around ~1
  // req/sec — this per-user throttle (paired with the map's own 600ms
  // pick-debounce) keeps normal use well inside that even without a shared
  // global limiter (see `rate-limit.ts`'s single-instance caveat).
  const limited = rateLimit(`geocode:${userId}`, {
    windowMs: 60_000,
    max: 20,
  });
  if (!limited.ok)
    return { ok: false, error: "تعداد درخواست زیاد بود؛ کمی صبر کنید." };

  try {
    const { lat, lng } = parsed.data;
    const siteUrl = process.env.BETTER_AUTH_URL || "https://mallikids.ir";
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=fa`,
      {
        // 📛 Nominatim blocks generic/browser-like callers — its usage
        // policy requires a real identifying User-Agent (no key needed,
        // just honesty about who's calling).
        headers: { "User-Agent": `MalliKids/1 (${siteUrl})` },
        signal: AbortSignal.timeout(8000),
      },
    );
    const data = (await res.json().catch(() => null)) as {
      display_name?: string;
      address?: Record<string, string>;
    } | null;
    if (!res.ok || !data?.display_name) {
      return {
        ok: false,
        error: "آدرس این نقطه پیدا نشد؛ کمی نقشه را جابه‌جا کنید.",
      };
    }
    return {
      ok: true,
      data: { address: formatAddress(data.display_name, data.address) },
    };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
