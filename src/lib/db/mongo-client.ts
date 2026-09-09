import "server-only";
import { MongoClient } from "mongodb";
import { MONGODB_URI, cached } from "./shared";

// 🌐 Separate from mongoose.ts's connection — mongoose's nested mongodb copy has incompatible types.
export const connectMongoClient = cached("_mongoClient", () => {
  if (!process.env.MONGODB_URI) {
    const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
    if (isBuildPhase) {
      console.warn(
        "[db] MONGODB_URI not set during build — skipping MongoClient connection.",
      );
      return Promise.reject(
        new Error("MONGODB_URI not configured during build"),
      );
    }
  }
  return new MongoClient(MONGODB_URI).connect();
});
