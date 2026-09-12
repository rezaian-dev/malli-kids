import "server-only";
import { MongoClient } from "mongodb";
import { APIError, betterAuth } from "better-auth";
import { admin, phoneNumber } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectMongoClient } from "@/lib/db/mongo-client";
import { getMongooseUri } from "@/lib/db/shared";
import { authSecondaryStorage, redis } from "@/lib/redis";
import { sendOTP } from "@/lib/sms";
import { OTP_EXPIRES_IN, OTP_LEN } from "./schemas";
import { createPhonePolicy } from "./phone-policy";
import { cached } from "@/lib/db/shared";

// ⚙️ No native client passed → transactions stay disabled (required for a non-replica-set Mongo).
//
// 🛡️ Build-safe: this is a TOP-LEVEL await, so any rejection here doesn't just fail one
// request — it crashes the *module*, which crashes every page whose import graph touches
// it. AuthModal is mounted in the root layout and pulls in this file via the auth server
// actions, so `next build`'s "Collecting page data" step loads this module for pages that
// never call `/api/auth` at all (e.g. /articles/[slug], /product/[id]) — that's why a Mongo
// auth failure here surfaced as those pages' build errors. connectMongoClient()'s own guard
// only skips the network call when MONGODB_URI is completely unset; it still attempts (and
// can fail) a real connection when the var IS set but the credentials/host are wrong — which
// is exactly what happened. No HTTP request ever hits this route during build, so we don't
// need a working connection yet: hand mongodbAdapter an unconnected client and let the driver
// connect lazily on first real query. At actual runtime (`next start`) this always goes
// through the normal, already-battle-tested connectMongoClient() path below.
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

// A partial unique index permits legacy users with no phone, while preventing
// two concurrent signups/phone changes from ever owning the same number.
// Lazy: no index mutation/network call during `next build`.
const ensurePhoneIndex = cached("_authPhoneIndex", () =>
  db
    .collection("user")
    .createIndex(
      { phoneNumber: 1 },
      {
        name: "malli_user_phone_unique",
        unique: true,
        partialFilterExpression: { phoneNumber: { $type: "string" } },
      },
    ),
);

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
  if (!ok)
    throw new APIError("BAD_GATEWAY", {
      code: "SMS_DELIVERY_FAILED",
      message: "SMS delivery failed",
    });
}

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  hooks: {
    before: createPhonePolicy(async (body): Promise<void> => {
      await auth.api.consumePhoneNumberOTP({ body });
    }, ensurePhoneIndex),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          if (ctx?.path !== "/sign-up/email") return;
          // The before hook has already consumed the proof. Never accept a
          // client-supplied phoneNumberVerified flag or persist the OTP.
          return {
            data: {
              ...user,
              phoneNumber: ctx.body.phoneNumber,
              phoneNumberVerified: true,
            },
          };
        },
      },
    },
  },
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
      "/sign-up/email": { window: 600, max: 10 },
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
      expiresIn: OTP_EXPIRES_IN,
      allowedAttempts: 5,
      requireVerification: true,
      phoneNumberValidator: (value) => /^09\d{9}$/.test(value),
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
