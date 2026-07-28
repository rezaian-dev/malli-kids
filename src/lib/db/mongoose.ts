import "server-only";
import mongoose from "mongoose";
import { MONGODB_URI, cached } from "./shared";

// 🌐 The app's main ODM connection — every Mongoose model (see
// `@/lib/db/models/profile.ts`) is built against this. Better Auth uses its own
// separate client instead of this one; see `mongo-client.ts`.
export const connectMongoose = cached("_mongoose", () =>
  mongoose.connect(MONGODB_URI),
);
