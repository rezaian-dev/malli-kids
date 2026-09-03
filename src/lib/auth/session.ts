import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "./auth";
import { buildUser } from "./user";
import type { User } from "@/types";

/** 🧊 One real session lookup per request, however many times it's asked
 *  for — the root layout's `getSessionUser()` and every `/admin/**`
 *  page's/layout's `requireAdmin()` (see `./admin`) all resolve through
 *  this same cached call within one request instead of each hitting Better
 *  Auth's session lookup independently. */
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

/** 👤 Maps the current Better Auth session + the user's persisted `Profile`
 *  doc into the app's `User` shape. Used once, server-side, in the root
 *  layout — so `useStore().user` is always already complete, everywhere, on
 *  the very first render (no post-hydration "fields pop in" flash). */
export async function getSessionUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;

  return buildUser(session.user);
}
