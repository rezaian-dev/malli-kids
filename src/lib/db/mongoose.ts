import "server-only";
import mongoose from "mongoose";
import { MONGODB_URI, cached } from "./shared";

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
  return mongoose.connect(MONGODB_URI);
});
