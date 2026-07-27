import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getSession } from "./session";
import { buildUser } from "./user";
import { connectMongoClient } from "@/lib/db/mongo-client";
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

/** 🔁 Turns an `ADMIN_EMAILS` bootstrap match into a *real*, durable
 *  `role: "admin"` on the Better Auth user record, the first time that
 *  email shows up with a session — a no-op every call after.
 *
 *  Without this, `isAdminUser()` above happily lets a bootstrap admin into
 *  every `/admin/**` page (this app's own gate), but Better Auth's *own*
 *  `admin()` plugin endpoints — `listUsers`, `setRole`, `banUser`, the ones
 *  `/admin/customers` actually calls — check `session.user.role` directly
 *  and have no idea `ADMIN_EMAILS` exists. Confirmed the hard way: a
 *  bootstrap-only admin opening `/admin/customers` got a hard 500,
 *  `YOU_ARE_NOT_ALLOWED_TO_LIST_USERS`, from `auth.api.listUsers` — this app
 *  said yes, Better Auth's own plugin said no.
 *
 *  Writes straight to the `user` collection instead of calling
 *  `auth.api.setRole` — that call requires an *already-admin* session to
 *  authorize itself, which is exactly the bootstrap problem. */
async function syncBootstrapAdminRole(user: {
  id: string;
  email: string;
  role?: string | null;
}) {
  if (user.role === "admin") return;
  if (!ADMIN_EMAILS.has(user.email.toLowerCase())) return;

  const client = await connectMongoClient();
  // ⚠️ Better Auth's own id (`user.id`, a plain string) and this collection's
  // real `_id` (a BSON `ObjectId`) aren't the same value type — filtering by
  // the bare string here would silently match zero documents.
  await client
    .db()
    .collection("user")
    .updateOne({ _id: new ObjectId(user.id) }, { $set: { role: "admin" } });
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

  await syncBootstrapAdminRole(session.user);
  return buildUser(session.user);
}

/** 🚦 The real access-control boundary for every `/admin/**` page (not
 *  Server Actions, which use `requireAdmin()` above and return an
 *  `ActionResult` instead of redirecting). Tells the two failure cases
 *  apart instead of bouncing both to the login screen: no session at all →
 *  `/admin/login`; a real, signed-in customer who just isn't an admin →
 *  `/` (a login form would only confuse them — logging in again as the
 *  same account won't grant access). */
export async function requireAdminPage(): Promise<User> {
  const session = await getSession();
  if (!session?.user) redirect("/admin/login");
  if (!isAdminUser(session.user)) redirect("/");

  await syncBootstrapAdminRole(session.user);
  return buildUser(session.user);
}
