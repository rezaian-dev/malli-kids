import "server-only";
import { MongoClient } from "mongodb";
import { MONGODB_URI, cached } from "./shared";

// 🌐 Separate from mongoose.ts's connection — mongoose's nested mongodb copy has incompatible types.
export const connectMongoClient = cached("_mongoClient", () =>
  new MongoClient(MONGODB_URI).connect(),
);
