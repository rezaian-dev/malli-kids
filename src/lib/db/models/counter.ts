import { Schema, model, models, type Model } from "mongoose";

import { connectMongoose } from "../mongoose";

type CounterDoc = {
  _id: string;
  seq: number;
};

const counterSchema = new Schema<CounterDoc>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { collection: "counters", versionKey: false },
);

const CounterModel: Model<CounterDoc> =
  models.Counter ?? model<CounterDoc>("Counter", counterSchema);

/** 🔢 Atomic serial allocator — `$inc` is single-document-atomic in
 *  MongoDB, so concurrent callers never receive the same number.
 *  `start` only clamps the very first allocation for a key (ticket
 *  numbers begin at 1001); later calls keep incrementing. */
export async function getNextSequence(key: string, start = 1): Promise<number> {
  await connectMongoose();
  const first = await CounterModel.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true },
  ).lean<CounterDoc>();
  if (!first || first.seq >= start) return first?.seq ?? start;

  // First allocation for this key (or a legacy counter below `start`):
  // clamp it up to `start` exactly once; a concurrent loser re-increments.
  const clamped = await CounterModel.findOneAndUpdate(
    { _id: key, seq: { $lt: start } },
    { $set: { seq: start } },
    { returnDocument: "after" },
  ).lean<CounterDoc>();
  if (clamped) return clamped.seq;
  const retry = await CounterModel.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { returnDocument: "after" },
  ).lean<CounterDoc>();
  return retry?.seq ?? start;
}
