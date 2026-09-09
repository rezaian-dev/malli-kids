import "server-only";
import { betterAuth } from "better-auth";
import { admin, phoneNumber } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectMongoClient } from "@/lib/db/mongo-client";
import { authSecondaryStorage, redis } from "@/lib/redis";
import { sendOTP } from "@/lib/sms";
import { OTP_LEN } from "./schemas";

// ⚙️ No native client passed → transactions stay disabled (required for a non-replica-set Mongo).
const client = await connectMongoClient();
const db = client.db();

// 💸 sendOTP returns false (never throws) on a delivery failure — surface that as a
// rejection so the endpoint actually errors out instead of silently reporting "sent".
async function sendPhoneOTP({
  phoneNumber: to,
  code,
}: {
  phoneNumber: string;
  code: string;
}) {
  const ok = await sendOTP(to, code);
  if (!ok) throw new Error("failed to send OTP SMS");
}

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
    // ✉️➡️📱 No email-based reset anymore — SMTP cost cut in favor of the SMS
    // panel already paying for OTP delivery below (see the `phoneNumber` plugin).
  },
  // 🔴 Vercel runs each request on any of N serverless instances, so an in-memory
  // counter (the library default) can't actually enforce a shared limit — every
  // instance gets its own quota. Redis makes the count real; without it we fall
  // back to memory (fine for local dev, where rate limiting is off anyway).
  secondaryStorage: authSecondaryStorage,
  // 🛡️ Tighter limits beyond the default: brute-force login and phone-OTP abuse
  // (each SMS costs money, so these are deliberately stingier than the defaults).
  rateLimit: {
    storage: redis ? "secondary-storage" : "memory",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/phone-number/send-otp": { window: 120, max: 2 },
      "/phone-number/verify": { window: 600, max: 5 },
      "/phone-number/request-password-reset": { window: 600, max: 3 },
      "/phone-number/reset-password": { window: 600, max: 5 },
    },
  },
  plugins: [
    admin(),
    // 📱 Replaces the old SMTP "forgot password" email: OTP is texted via the
    // SMS panel for both password reset and (once a user links+verifies a
    // phone) passwordless OTP login. `otpLength` matches the 5-box UI in
    // `auth-otp-panel.tsx` — the built-in default is 6.
    phoneNumber({
      otpLength: OTP_LEN,
      sendOTP: sendPhoneOTP,
      sendPasswordResetOTP: sendPhoneOTP,
      // 🆕 A phone number nobody's seen before gets an account on the spot —
      // matches the login tab's UX: enter phone, get code, you're in, whether
      // this is your first time or your hundredth. Real email/password stays
      // available too; this email is just a placeholder Better Auth requires.
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => `${phoneNumber}@phone.mallikids.local`,
        getTempName: (phoneNumber) => phoneNumber,
      },
    }),
    // 🍪 nextCookies() must stay last — it lets server actions set the session cookie directly.
    nextCookies(),
  ],
});
