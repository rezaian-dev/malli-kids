import "server-only";
import { MongoClient } from "mongodb";
import {
  cached,
  getMongooseUri,
  MONGO_CONNECTION_OPTIONS,
  requireBuildDatabase,
  rethrowMongoError,
} from "./shared";

export const connectMongoClient = cached("_mongoClient", async () => {
  requireBuildDatabase();
  return new MongoClient(getMongooseUri(), MONGO_CONNECTION_OPTIONS)
    .connect()
    .catch(rethrowMongoError);
});

// Authentication modules must load even when the database is unavailable.
export async function getAuthMongoClient(): Promise<MongoClient> {
  if (process.env.NEXT_PHASE !== "phase-production-build") {
    try {
      return await connectMongoClient();
    } catch {
      console.error("[auth] Database unavailable; retrying lazily on the next query.");
    }
  }
  return new MongoClient(getMongooseUri(), MONGO_CONNECTION_OPTIONS);
}
