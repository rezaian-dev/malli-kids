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
  session: { cookieCache: { enabled: true, maxAge: 5 * 60 } },
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
