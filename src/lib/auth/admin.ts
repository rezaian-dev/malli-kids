import { getSession } from "./session";
import { buildUser } from "./user";
import type { User } from "@/types";

// 🔐 Zero-script bootstrap: no user can have `role: "admin"` until *some*
// account already exists to set it on (Better Auth's admin plugin only
// exposes `auth.api.setRole`, which this app doesn't wire into a UI yet —
// that's a user-management feature, not an auth fix). Sign up normally,
// list your email here, restart — you're the durable `role` mechanism's
// first admin. Never exposed to the client; read only in this file.
const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

/** 🛡️ The one real authorization check for admin access: a persisted
 *  `role` on the Better Auth user (server-managed — never client-settable,
 *  see the `admin()` plugin in `./auth`), OR the `ADMIN_EMAILS` bootstrap
 *  allowlist above. Both are pure server-side checks on a real identity —
 *  neither is a second authentication system. */
export function isAdminUser(user: { role?: string | null; email: string }) {
  return user.role === "admin" || ADMIN_EMAILS.has(user.email.toLowerCase());
}

/** 🔒 The server-side authorization boundary for everything under `/admin`.
 *  Verifies a real Better Auth session exists AND that its user is an admin
 *  — returns `null` on any failure (no session, or a signed-in non-admin)
 *  rather than throwing, so every caller — Server Component, Server Action,
 *  Route Handler — decides its own rejection (`redirect()`, an `ActionResult`
 *  error, a `403`). This is the actual security boundary; any client-side
 *  gate is UX only and must never be trusted in its place. */
export async function requireAdmin(): Promise<User | null> {
  const session = await getSession();
  if (!session?.user || !isAdminUser(session.user)) return null;

  return buildUser(session.user);
}
