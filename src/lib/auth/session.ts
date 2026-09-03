import { headers } from "next/headers";
import { auth } from "./auth";
import { buildUser } from "./user";
import type { User } from "@/types";

/** 👤 Maps the current Better Auth session + the user's persisted `Profile`
 *  doc into the app's `User` shape. Used once, server-side, in the root
 *  layout — so `useStore().user` is always already complete, everywhere, on
 *  the very first render (no post-hydration "fields pop in" flash). */
export async function getSessionUser(): Promise<User | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  return buildUser(session.user);
}
