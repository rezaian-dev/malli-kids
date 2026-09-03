import { betterAuth } from "better-auth";
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
  // 🍪 Must stay the last plugin — it's what lets the server actions in
  // `@/lib/auth/actions` call `auth.api.*` directly and have the
  // session cookie set on the response without any client-side fetch.
  plugins: [nextCookies()],
});
