import "server-only";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getAuthMongoClient } from "@/lib/db/mongo-client";

// Share identities, but keep admin sessions and cookies separate.
const db = (await getAuthMongoClient()).db();

export const adminAuth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: "/api/admin-auth",
  // Same short cookie-cache trade-off as the storefront instance.
  session: {
    modelName: "adminSession",
    cookieCache: { enabled: true, maxAge: 30 },
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  // Brute-force login guard, same shape as the storefront instance.
  rateLimit: {
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
    },
  },
  // Keep admin cookies separate from storefront cookies.
  advanced: {
    cookiePrefix: "malli-admin",
  },
  // Keep nextCookies last so server actions can set cookies.
  plugins: [admin(), nextCookies()],
});
