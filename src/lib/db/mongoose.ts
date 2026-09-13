import "server-only";
import mongoose from "mongoose";
import {
  cached,
  getMongooseUri,
  requireBuildDatabase,
  rethrowMongoError,
} from "./shared";

export const connectMongoose = cached("_mongoose", async () => {
  requireBuildDatabase();
  return mongoose.connect(getMongooseUri()).catch(rethrowMongoError);
});
