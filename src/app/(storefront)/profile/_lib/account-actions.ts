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

// Biggest → smallest; essential levels never drop, finest trims first
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

// Ignore administrative prefixes when comparing address parts.
const ADMIN_SCOPE_PREFIX = /^(استان|شهرستان|بخش|دهستان)\s+/;
const addressCore = (value: string) => value.replace(ADMIN_SCOPE_PREFIX, "");

// Build from address fields to avoid repeated city names.
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

  // Drop optional parts finest-first; essential ones stay
  let trimmed = parts;
  while (join(trimmed).length > ADDRESS_MAX_LEN) {
    const i = trimmed.map((p) => p.essential).lastIndexOf(false);
    if (i === -1) break;
    trimmed = [...trimmed.slice(0, i), ...trimmed.slice(i + 1)];
  }

  const text = join(trimmed);
  return text.length > ADDRESS_MAX_LEN ? text.slice(0, ADDRESS_MAX_LEN) : text;
}

export async function reverseGeocodeAction(
  values: ReverseGeocodeValues,
): Promise<ActionResult<{ address: string }>> {
  const parsed = reverseGeocodeSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "مختصات نامعتبر است." };

  const userId = await requireUserId();
  if (!userId) return { ok: false, error: AUTH_ERROR };

  // Nominatim caps ~1 req/sec — per-user throttle stays inside the policy
  const limited = await rateLimit(`geocode:${userId}`, {
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
        // Nominatim requires an identifying User-Agent
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
