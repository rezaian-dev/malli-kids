import { cache } from "react";
import { headers } from "next/headers";
import { APIError } from "better-auth";
import { auth } from "./auth";
import { buildUser } from "./user";
import type { User } from "@/types";

/** 🧊 One real session lookup per request, however many times it's asked
 *  for — the root layout's `getSessionUser()`, every `/admin/**`
 *  page's/layout's `requireAdmin()` (see `./admin`), and every storefront
 *  Server Action's own `requireUserId()`/`requireSessionUser()` all resolve
 *  through this same cached call within one request instead of each hitting
 *  Better Auth's session lookup independently.
 *
 *  🚫 Also the one place a banned user's session is handled: Better Auth's
 *  `admin()` plugin hooks `/get-session` to *throw* (`BANNED_USER`) once
 *  `user.banned` is true, rather than just returning no session — without
 *  this `catch`, that throw would bubble out of here into the root layout's
 *  render on their very next request and crash the page instead of quietly
 *  treating them as signed out (which is exactly right: every cart/
 *  favorite/checkout action already requires a session). Only that specific
 *  code is swallowed — anything else (a real DB hiccup, say) rethrows, so
 *  this never quietly masks an unrelated failure as "logged out". */
export const getSession = cache(async () => {
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch (error) {
    const code =
      error instanceof APIError ? (error.body as { code?: string })?.code : undefined;
    if (code === "BANNED_USER") return null;
    throw error;
  }
});

/** 👤 Maps the current Better Auth session + the user's persisted `Profile`
 *  doc into the app's `User` shape. Used once, server-side, in the root
 *  layout — so `useStore().user` is always already complete, everywhere, on
 *  the very first render (no post-hydration "fields pop in" flash). */
export async function getSessionUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;

  return buildUser(session.user);
}
