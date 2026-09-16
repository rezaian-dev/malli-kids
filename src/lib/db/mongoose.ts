import "server-only";
import mongoose from "mongoose";
import {
  cached,
  getMongooseUri,
  MONGO_CONNECTION_OPTIONS,
  requireBuildDatabase,
  rethrowMongoError,
} from "./shared";

export const connectMongoose = cached("_mongoose", async () => {
  requireBuildDatabase();
  return mongoose
    .connect(getMongooseUri(), MONGO_CONNECTION_OPTIONS)
    .catch(rethrowMongoError);
});
