import "server-only";
import mongoose from "mongoose";
import { MONGODB_URI, cached, getMongooseUri } from "./shared";

// 🌐 The app's main ODM connection; Better Auth uses its own separate client (see mongo-client.ts).
// 🛡️ During `next build` Pars (and similar hosts) run `Collecting page data` without runtime env.
// If MONGODB_URI is missing the fallback `mongodb://localhost...` hits a host Mongo that requires
// authentication → `MongoServerError: Command find requires authentication (code 13)` and the build
// crashes on /articles/[slug] & /product/[id]. We detect the build phase and reject early so
// callers can return empty data and let ISR hydrate at runtime.
export const connectMongoose = cached("_mongoose", () => {
  if (!process.env.MONGODB_URI) {
    const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
    if (isBuildPhase) {
      console.warn(
        "[db] MONGODB_URI not set during build — skipping MongoDB connection. ISR will hydrate at runtime.",
      );
      return Promise.reject(
        new Error("MONGODB_URI not configured during build"),
      );
    }
  }
  const uri = getMongooseUri();
  // Helpful warning when authSource was auto-added
  if (uri !== MONGODB_URI && !MONGODB_URI.includes("authSource=")) {
    console.log(`[db] Using Mongo URI with auto authSource: ${uri.replace(/:[^:@]+@/, ":****@")}`);
  }
  return mongoose.connect(uri).catch((err) => {
    // 🔍 AuthenticationFailed (code 18) almost always means wrong authSource on cPanel hosts.
    const code = (err as { code?: number })?.code;
    const msg = (err as Error)?.message ?? "";
    if (code === 18 || msg.includes("Authentication failed")) {
      console.error(
        `[db] Mongo Authentication failed. For cPanel DB mallikid_mallkidsDB, use:\n` +
        `  mongodb://mallikid_mrezaian:***@localhost:27017/mallikid_mallkidsDB?authSource=mallikid_mallkidsDB\n` +
        `Current URI (masked): ${uri.replace(/:[^:@]+@/, ":****@")}\n` +
        `If running locally, use mongodb://localhost:27017/malli-kids without credentials; the host URI only works ON the host (localhost = host itself).`
      );
    }
    throw err;
  });
});
