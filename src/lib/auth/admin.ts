import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { cache } from "react";
import { ObjectId } from "mongodb";
import { adminAuth } from "./admin-auth";
import { buildUser } from "./user";
import { connectMongoClient } from "@/lib/db/mongo-client";
import type { User } from "@/types";

// 🔐 Bootstrap allowlist: list your email, sign up, restart — you become the first durable admin.
const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

// 🛡️ Admin access: a persisted server-managed role OR the ADMIN_EMAILS bootstrap allowlist.
export function isAdminUser(user: { role?: string | null; email: string }) {
  return user.role === "admin" || ADMIN_EMAILS.has(user.email.toLowerCase());
}

// 🔁 Persists a bootstrap admin's role — the plugin checks role, not
// ADMIN_EMAILS
async function syncBootstrapAdminRole(user: {
  id: string;
  email: string;
  role?: string | null;
}) {
  if (user.role === "admin") return;
  if (!ADMIN_EMAILS.has(user.email.toLowerCase())) return;

  const client = await connectMongoClient();
  // ⚠️ user.id is a string but _id is an ObjectId — filtering by the bare string matches nothing.
  await client
    .db()
    .collection("user")
    .updateOne({ _id: new ObjectId(user.id) }, { $set: { role: "admin" } });
}

// 🧊 One admin-session lookup per request, off the admin-only cookie
// (`adminAuth`) — entirely separate from the storefront's getSession() in
// `session.ts`. A storefront login (or its absence) never affects this.
export const getAdminSession = cache(async () => {
  return adminAuth.api.getSession({ headers: await headers() });
});

// 🔒 Real /admin authorization boundary; null (not throw) so callers pick their rejection
export async function requireAdmin(): Promise<User | null> {
  const session = await getAdminSession();
  if (!session?.user || !isAdminUser(session.user)) return null;

  await syncBootstrapAdminRole(session.user);
  return buildUser(session.user);
}

// 🚦 Page-level boundary: no admin session, or a signed-in non-admin →
// /admin/login either way — this cookie has no storefront-side destination
// to bounce a non-admin back to.
export async function requireAdminPage(): Promise<User> {
  const session = await getAdminSession();
  if (!session?.user || !isAdminUser(session.user)) redirect("/admin/login");

  await syncBootstrapAdminRole(session.user);
  return buildUser(session.user);
}
