import { connectMongoose } from "@/lib/db/mongoose";
import {
  CannedResponseModel,
  type CannedResponseDoc,
} from "@/lib/db/models/canned-response";

import type { CannedResponse } from "@/lib/support/canned-defaults";

export type { CannedResponse };

function toCanned(
  doc: CannedResponseDoc & { _id: { toString(): string } },
): CannedResponse {
  return { id: doc._id.toString(), title: doc.title, body: doc.body };
}

export async function getCannedResponses(): Promise<CannedResponse[]> {
  await connectMongoose();
  const docs = await CannedResponseModel.find().sort({ createdAt: 1 }).lean();
  return docs.map(toCanned);
}

export async function createCannedResponse(input: {
  title: string;
  body: string;
}): Promise<CannedResponse> {
  await connectMongoose();
  const doc = await CannedResponseModel.create({
    title: input.title.trim().slice(0, 60),
    body: input.body.trim().slice(0, 1000),
  });
  return toCanned(doc.toObject());
}

export async function removeCannedResponse(id: string): Promise<boolean> {
  await connectMongoose();
  const removed = await CannedResponseModel.deleteOne({ _id: id });
  return removed.deletedCount > 0;
}
