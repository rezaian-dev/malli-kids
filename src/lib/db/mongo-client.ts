import "server-only";
import { MongoClient } from "mongodb";
import { MONGODB_URI, cached } from "./shared";

// 🌐 A native driver client dedicated to Better Auth's adapter — kept apart
// from `mongoose.ts`'s connection because mongoose bundles its own nested
// `mongodb` copy, whose `Db`/`MongoClient` types don't structurally match
// this package's (see the `mongoose-mongodb-type-conflict` note).
export const connectMongoClient = cached("_mongoClient", () =>
  new MongoClient(MONGODB_URI).connect(),
);
