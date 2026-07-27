import "server-only";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectMongoClient } from "@/lib/db/mongo-client";
import { sendEmail } from "@/lib/email";
import { resetPasswordEmail } from "./emails";

// No native `client` passed to the adapter → transactions stay disabled,
// which is what a plain standalone `mongodb://localhost:27017` (no replica
// set) requires; a hosted/replica-set Mongo can add one later for free.
const client = await connectMongoClient();
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  // ⚡ The root layout calls getSession() on every single page render (see
  // `@/lib/auth/session`) — a short signed-cookie cache keeps that from
  // hitting Mongo on every navigation.
  //
  // 🚫 Trade-off, not a bug to "fully fix" without dropping the cache
  // entirely: a cache *hit* here returns the session/user payload straight
  // from the signed cookie, with no DB round-trip — so `admin.banUser()`
  // deleting the target's DB session (see `setCustomerStatusAction`) has no
  // way to reach a copy of their session already sitting in their own
  // browser's cookie. Confirmed live: a freshly-banned user's existing
  // session kept answering `/api/auth/get-session` with 200 for as long as
  // this cache stayed warm — `getSession()`'s own `BANNED_USER` handling
  // (see `@/lib/auth/session`) only ever fires on a cache *miss* (the
  // request that actually reaches Mongo), since Better Auth's `admin()`
  // plugin has no `/get-session` hook of its own — only a session-*creation*
  // check (bans a fresh sign-in, not a session already in progress). 30s
  // (not 0, which would defeat the cache's whole purpose) keeps the ban →
  // "actually logged out" gap small enough to be an acceptable trade rather
  // than the 5-minute one this used to be, while still absorbing a normal
  // multi-page browsing burst's worth of `getSession()` calls into one
  // Mongo hit.
  session: { cookieCache: { enabled: true, maxAge: 30 } },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      const { subject, html } = resetPasswordEmail(user.name, url);
      await sendEmail({ to: user.email, subject, html });
    },
  },
  // 🛡️ Built-in limiter is already on by default in production (10s/100req);
  // tighten specific endpoints beyond that default:
  // - `/sign-in/email`: credential-stuffing/brute force — shared by the
  //   storefront and the admin login, both go through this same call.
  // - `/request-password-reset` (called by `forgotPasswordAction`): without
  //   this, someone could repeatedly email-bomb any address they type in.
  // - `/reset-password` (called by `resetPasswordAction`): slows down
  //   brute-forcing a leaked/guessed reset token.
  rateLimit: {
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 600, max: 3 },
      "/reset-password": { window: 600, max: 5 },
    },
  },
  // 👮 Adds a server-managed `role`/`banned` field to the real `user`
  // collection (never client-settable — see `@/lib/auth/admin`'s
  // `requireAdmin()`, the actual authorization boundary for `/admin/**`).
  // 🍪 `nextCookies()` must stay the last plugin — it's what lets the server
  // actions in `@/lib/auth/actions` call `auth.api.*` directly and have the
  // session cookie set on the response without any client-side fetch.
  plugins: [admin(), nextCookies()],
});
