import "server-only";
import { MongoClient } from "mongodb";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectMongoClient } from "@/lib/db/mongo-client";
import { getMongooseUri } from "@/lib/db/shared";

// 🛡️ A second, fully independent Better Auth instance for `/admin`.
//
// It reads/writes the SAME Mongo `user`/`account` collections as the
// storefront's `auth` (src/lib/auth/auth.ts) — admins are just User docs
// with role "admin", see `isAdminUser` — but keeps its own `adminSession`
// collection and its own cookie namespace (`advanced.cookiePrefix`). That
// means signing in or out of the admin panel never sets, reads, or clears
// the storefront's cookie, and vice versa: the two surfaces share
// credentials but never share a login state, even in the same browser.
//
// Sign-up stays off — admin accounts are only ever created by promoting an
// existing customer (see `promoteCustomerAction`), never by submitting this
// login form.
//
// 🛡️ Build-safe for the same reason as src/lib/auth/auth.ts: this is a top-level
// await, so a real (not just "missing env") Mongo connection failure here would
// crash the module and, with it, every page whose build-time import graph touches
// it — see that file's comment for the full explanation.
let client: MongoClient;
if (process.env.NEXT_PHASE === "phase-production-build") {
  client = new MongoClient(getMongooseUri());
} else {
  try {
    client = await connectMongoClient();
  } catch (err) {
    console.error(
      "[auth] Mongo initial connect failed — falling back to lazy client. App will still render (guest) until DB is reachable:",
      (err as Error).message,
    );
    client = new MongoClient(getMongooseUri());
  }
}
const db = client.db();

export const adminAuth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: "/api/admin-auth",
  // ⚡ Same short cookie-cache trade-off as the storefront instance.
  session: {
    modelName: "adminSession",
    cookieCache: { enabled: true, maxAge: 30 },
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  // 🛡️ Brute-force login guard, same shape as the storefront instance.
  rateLimit: {
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
    },
  },
  // 🍪 Distinct cookie names so the admin session never overlaps the
  // storefront's `better-auth.*` cookies.
  advanced: {
    cookiePrefix: "malli-admin",
  },
  // 👮 Needed so `role`/`banned` come back on `session.user` here too — the
  // fields live on the shared `user` collection either way.
  // 🍪 nextCookies() must stay last — it lets server actions set the cookie directly.
  plugins: [admin(), nextCookies()],
});
