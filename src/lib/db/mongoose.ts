import "server-only";
import mongoose from "mongoose";
import { MONGODB_URI, cached } from "./shared";

// 🌐 The app's main ODM connection; Better Auth uses its own separate client (see mongo-client.ts).
export const connectMongoose = cached("_mongoose", () =>
  mongoose.connect(MONGODB_URI),
);
