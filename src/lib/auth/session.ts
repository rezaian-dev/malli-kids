import { cache } from "react";
import { headers } from "next/headers";
import { APIError } from "better-auth";
import { auth } from "./auth";
import { buildUser } from "./user";
import type { User } from "@/types";

// Cache session reads per request; suppress only BANNED_USER.
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

// Called once in the root layout so useAuth().user is complete on first render.
export async function getSessionUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;

  return buildUser(session.user);
}
