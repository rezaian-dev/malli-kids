import "server-only";
import { MongoClient } from "mongodb";
import { MONGODB_URI, cached, getMongooseUri } from "./shared";

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
  const uri = getMongooseUri();
  if (uri !== MONGODB_URI && !MONGODB_URI.includes("authSource=")) {
    console.log(`[db] MongoClient using auto authSource URI: ${uri.replace(/:[^:@]+@/, ":****@")}`);
  }
  return new MongoClient(uri).connect().catch((err) => {
    const code = (err as { code?: number })?.code;
    const msg = (err as Error)?.message ?? "";
    if (code === 18 || msg.includes("Authentication failed")) {
      console.error(
        `[db] MongoClient Authentication failed. Use ?authSource=mallikid_mallkidsDB — see mongoose.ts note. Masked URI: ${uri.replace(/:[^:@]+@/, ":****@")}`
      );
    }
    throw err;
  });
});
