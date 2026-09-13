import "server-only";
import { APIError, betterAuth } from "better-auth";
import { admin, phoneNumber } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getAuthMongoClient } from "@/lib/db/mongo-client";
import { authSecondaryStorage, redis } from "@/lib/redis";
import { sendOTP } from "@/lib/sms";
import { OTP_EXPIRES_IN, OTP_LEN } from "./schemas";
import { createPhonePolicy } from "./phone-policy";
import { cached } from "@/lib/db/shared";

// Use a lazy client during builds; standalone Mongo does not support transactions.
const db = (await getAuthMongoClient()).db();

// Enforce unique phone ownership while allowing legacy users without a phone.
const ensurePhoneIndex = cached("_authPhoneIndex", () =>
  db.collection("user").createIndex(
    { phoneNumber: 1 },
    {
      name: "malli_user_phone_unique",
      unique: true,
      partialFilterExpression: { phoneNumber: { $type: "string" } },
    },
  ),
);

// Reject failed SMS delivery instead of reporting success.
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
          // Trust only consumed OTP proof; never store the code or client verification flags.
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
  // Skips Mongo per getSession(); a banned user lingers ≤30s — accepted
  session: { cookieCache: { enabled: true, maxAge: 30 } },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    revokeSessionsOnPasswordReset: true,
    // Password recovery uses SMS, not email.
  },
  // Use Redis to share limits across processes when configured.
  secondaryStorage: authSecondaryStorage,
  // Limit login attempts and paid SMS requests.
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
    // Keep OTP length consistent with the form.
    phoneNumber({
      otpLength: OTP_LEN,
      expiresIn: OTP_EXPIRES_IN,
      allowedAttempts: 5,
      requireVerification: true,
      phoneNumberValidator: (value) => /^09\d{9}$/.test(value),
      sendOTP: sendPhoneOTP,
      sendPasswordResetOTP: sendPhoneOTP,
      // Better Auth requires a placeholder email for phone-only accounts.
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => `${phoneNumber}@phone.mallikids.local`,
        getTempName: (phoneNumber) => phoneNumber,
      },
    }),
    // nextCookies() must stay last — it lets server actions set the session cookie directly.
    nextCookies(),
  ],
});
