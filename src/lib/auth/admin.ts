import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getSession } from "./session";
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

// 🔒 Real /admin authorization boundary; null (not throw) so callers pick their rejection
export async function requireAdmin(): Promise<User | null> {
  const session = await getSession();
  if (!session?.user || !isAdminUser(session.user)) return null;

  await syncBootstrapAdminRole(session.user);
  return buildUser(session.user);
}

// 🚦 Page-level boundary: no session → /admin/login; signed-in non-admin → / (relogging in won't help them).
export async function requireAdminPage(): Promise<User> {
  const session = await getSession();
  if (!session?.user) redirect("/admin/login");
  if (!isAdminUser(session.user)) redirect("/");

  await syncBootstrapAdminRole(session.user);
  return buildUser(session.user);
}
