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
 *  🚫 Also where a `BANNED_USER` throw is swallowed rather than left to
 *  crash the root layout's render. In the installed Better Auth version
 *  this only ever fires from the `admin()` plugin's session-*creation*
 *  hook — banning someone doesn't retroactively flag their already-issued
 *  session; see the `cookieCache` comment in `./auth` for how (and how
 *  quickly) a ban actually reaches an existing session. Kept here as
 *  defense in depth for whichever path does throw it (e.g. trying to sign
 *  in again while banned). Only that specific code is swallowed — anything
 *  else (a real DB hiccup, say) rethrows, so this never quietly masks an
 *  unrelated failure as "logged out". */
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
