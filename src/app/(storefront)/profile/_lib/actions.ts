"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getSession } from "@/lib/auth/session";
import { splitName } from "@/lib/auth/user";
import { connectMongoose } from "@/lib/db/mongoose";
import { rateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/action-result";
import type { User } from "@/types";
import { Profile } from "@/lib/db/models/profile";
import { getOrdersForUser } from "@/lib/shop/orders";
import {
  createTicket,
  getTicketsForUser,
  replyTicket,
  type Ticket,
} from "@/lib/shop/tickets";
import type { AdminOrder } from "@/types";
import {
  ADDRESS_MAX_LEN,
  AVATAR_MAX_BYTES,
  reverseGeocodeSchema,
  updateAccountSchema,
  updateChildSchema,
  type ReverseGeocodeValues,
  type UpdateAccountValues,
  type UpdateChildValues,
} from "./schemas";

const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const AUTH_ERROR = "برای این کار باید وارد حساب‌تان باشید.";

// 🔐 Every action re-checks the real session server-side — the client never
// gets to say whose profile it's editing.
async function requireUserId() {
  const session = await getSession();
  return session?.user.id ?? null;
}

async function requireSessionUser() {
  const session = await getSession();
  if (!session?.user) return null;
  return { id: session.user.id, name: session.user.name };
}

async function upsertProfile(userId: string, patch: Partial<User>) {
  await connectMongoose();
  await Profile.updateOne({ userId }, { $set: patch }, { upsert: true });
}

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

export async function updateChildAction(
  values: UpdateChildValues,
): Promise<ActionResult<Partial<User>>> {
  const parsed = updateChildSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  const userId = await requireUserId();
  if (!userId) return { ok: false, error: AUTH_ERROR };

  try {
    await upsertProfile(userId, parsed.data);
    return { ok: true, data: parsed.data };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function updateAvatarAction(
  dataUrl: string,
): Promise<ActionResult<Partial<User>>> {
  if (!dataUrl.startsWith("data:image/"))
    return { ok: false, error: "فقط فایلِ تصویری مجاز است." };

  const bytes = Math.ceil((dataUrl.length - dataUrl.indexOf(",") - 1) * 0.75);
  if (bytes > AVATAR_MAX_BYTES)
    return { ok: false, error: "حجمِ عکس نباید بیشتر از ۱ مگابایت باشد." };

  const userId = await requireUserId();
  if (!userId) return { ok: false, error: AUTH_ERROR };

  try {
    await upsertProfile(userId, { avatar: dataUrl });
    return { ok: true, data: { avatar: dataUrl } };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function getMyOrdersAction(): Promise<AdminOrder[]> {
  const userId = await requireUserId();
  if (!userId) return [];
  return getOrdersForUser(userId);
}

export async function getMyTicketsAction(): Promise<Ticket[]> {
  const userId = await requireUserId();
  if (!userId) return [];
  return getTicketsForUser(userId);
}

export async function createTicketAction(input: {
  subject: string;
  message: string;
}): Promise<ActionResult<Ticket>> {
  if (input.subject.trim().length < 3) {
    return { ok: false, error: "موضوع باید حداقل ۳ حرف باشد." };
  }
  if (input.message.trim().length < 10) {
    return { ok: false, error: "پیام باید حداقل ۱۰ حرف باشد." };
  }

  const user = await requireSessionUser();
  if (!user) return { ok: false, error: AUTH_ERROR };

  try {
    const ticket = await createTicket({
      userId: user.id,
      name: user.name,
      subject: input.subject,
      message: input.message,
    });
    return { ok: true, data: ticket };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function replyTicketAsUserAction(
  id: string,
  text: string,
): Promise<ActionResult> {
  if (text.trim().length < 2) return { ok: false, error: "پیام را بنویسید." };

  const userId = await requireUserId();
  if (!userId) return { ok: false, error: AUTH_ERROR };

  try {
    // 🔐 Scoped to `userId` — a signed-in user can only reply on their own
    // ticket, never one they merely guessed the id of.
    const found = await replyTicket(id, "user", text, { userId });
    if (!found) return { ok: false, error: "تیکت پیدا نشد." };
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function removeAvatarAction(): Promise<
  ActionResult<Partial<User>>
> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: AUTH_ERROR };

  try {
    await connectMongoose();
    // 🗑️ `$unset` (not `$set: {avatar: undefined}`, which the driver just
    // drops and does nothing) — actually removes the field.
    await Profile.updateOne({ userId }, { $unset: { avatar: "" } });
    return { ok: true, data: { avatar: undefined } };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
