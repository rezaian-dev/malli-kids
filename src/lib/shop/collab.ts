import { connectMongoose } from "@/lib/db/mongoose";
import {
  CollabRequestModel,
  type CollabRequestDoc,
  type CollabStatus,
} from "@/lib/db/models/collab-request";
import { faDateTime } from "@/lib/locale/fa";

export type { CollabStatus };
export type CollabRequest = {
  id: string;
  name: string;
  phone: string;
  kind: string;
  text: string;
  at: string;
  status: CollabStatus;
};

function toCollabRequest(
  doc: CollabRequestDoc & { _id: { toString(): string } },
): CollabRequest {
  return {
    id: doc._id.toString(),
    name: doc.name,
    phone: doc.phone,
    kind: doc.kind,
    text: doc.text,
    at: faDateTime(doc.createdAt),
    status: doc.status,
  };
}

export async function getAllCollabRequests(): Promise<CollabRequest[]> {
  await connectMongoose();
  const docs = await CollabRequestModel.find().sort({ createdAt: -1 }).lean();
  return docs.map(toCollabRequest);
}

export async function submitCollabRequest(input: {
  name: string;
  phone: string;
  kind: string;
  text: string;
}): Promise<CollabRequest> {
  await connectMongoose();
  const doc = await CollabRequestModel.create({
    ...input,
    status: "در انتظار بررسی",
  });
  return toCollabRequest(doc.toObject());
}

export async function setCollabStatus(
  id: string,
  status: CollabStatus,
): Promise<boolean> {
  await connectMongoose();
  const updated = await CollabRequestModel.updateOne(
    { _id: id },
    { $set: { status } },
  );
  return updated.matchedCount > 0;
}
