import { connectMongoose } from "@/lib/db/mongoose";
import {
  NotificationModel,
  type NotificationDoc,
  type NotificationKind,
} from "@/lib/db/models/notification";
import { faDateTime } from "@/lib/locale/fa";

export type { NotificationKind };
export type Notice = {
  id: string;
  kind: NotificationKind;
  text: string;
  at: string;
  read: boolean;
};

function toNotice(doc: NotificationDoc & { _id: { toString(): string }; createdAt: Date }): Notice {
  return {
    id: doc._id.toString(),
    kind: doc.kind,
    text: doc.text,
    at: faDateTime(doc.createdAt),
    read: doc.read,
  };
}

export async function getNotificationsForUser(userId: string): Promise<Notice[]> {
  await connectMongoose();
  const docs = await NotificationModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(60)
    .lean();
  return docs.map(toNotice);
}

export async function createNotification(input: {
  userId: string;
  kind: NotificationKind;
  text: string;
}): Promise<void> {
  await connectMongoose();
  await NotificationModel.create(input);
}

export async function markNotificationRead(id: string, userId: string): Promise<boolean> {
  await connectMongoose();
  const updated = await NotificationModel.updateOne(
    { _id: id, userId },
    { $set: { read: true } },
  );
  return updated.matchedCount > 0;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await connectMongoose();
  await NotificationModel.updateMany({ userId, read: false }, { $set: { read: true } });
}
