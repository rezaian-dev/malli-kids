import "server-only";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectMongoClient } from "@/lib/db/mongo-client";
import { sendEmail } from "@/lib/email";
import { resetPasswordEmail } from "./emails";

// ⚙️ No native client passed → transactions stay disabled (required for a non-replica-set Mongo).
const client = await connectMongoClient();
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  // ⚡ Skips Mongo per getSession(); a banned user lingers ≤30s — accepted
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
  // 🛡️ Tighter limits beyond the default: brute-force login, email-bombing, and reset-token guessing.
  rateLimit: {
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 600, max: 3 },
      "/reset-password": { window: 600, max: 5 },
    },
  },
  // 👮 Adds a server-managed role/banned field to the user collection.
  // 🍪 nextCookies() must stay last — it lets server actions set the session cookie directly.
  plugins: [admin(), nextCookies()],
});
