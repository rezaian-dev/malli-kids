import { connectMongoose } from "@/lib/db/mongoose";
import { TicketModel, type TicketDoc, type TicketStatus } from "@/lib/db/models/ticket";
import { faDateTime } from "@/lib/locale/fa";

export type { TicketStatus };
export type TicketReply = { from: "user" | "support"; text: string; at: string };
export type Ticket = {
  id: string;
  userId: string;
  name: string;
  subject: string;
  status: TicketStatus;
  createdAt: string;
  replies: TicketReply[];
};

function toTicket(doc: TicketDoc & { _id: { toString(): string }; createdAt: Date }): Ticket {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    name: doc.name,
    subject: doc.subject,
    status: doc.status,
    createdAt: faDateTime(doc.createdAt),
    replies: doc.replies.map((reply) => ({
      from: reply.from,
      text: reply.text,
      at: faDateTime(reply.at),
    })),
  };
}

export async function getAllTickets(): Promise<Ticket[]> {
  await connectMongoose();
  const docs = await TicketModel.find().sort({ updatedAt: -1 }).lean();
  return docs.map(toTicket);
}

export async function getTicketsForUser(userId: string): Promise<Ticket[]> {
  await connectMongoose();
  const docs = await TicketModel.find({ userId }).sort({ updatedAt: -1 }).lean();
  return docs.map(toTicket);
}

export async function createTicket(input: {
  userId: string;
  name: string;
  subject: string;
  message: string;
}): Promise<Ticket> {
  await connectMongoose();
  const doc = await TicketModel.create({
    userId: input.userId,
    name: input.name,
    subject: input.subject.trim(),
    status: "open",
    replies: [{ from: "user", text: input.message.trim(), at: new Date() }],
  });
  return toTicket(doc.toObject());
}

export async function replyTicket(
  id: string,
  from: "user" | "support",
  text: string,
  filter: Record<string, unknown> = {},
): Promise<Ticket | null> {
  await connectMongoose();
  const doc = await TicketModel.findOneAndUpdate(
    { _id: id, ...filter },
    {
      $push: { replies: { from, text: text.trim(), at: new Date() } },
      $set: { status: from === "support" ? "answered" : "open" },
    },
    { new: true },
  ).lean();
  return doc ? toTicket(doc) : null;
}

export async function setTicketStatus(
  id: string,
  status: TicketStatus,
): Promise<boolean> {
  await connectMongoose();
  const updated = await TicketModel.updateOne({ _id: id }, { $set: { status } });
  return updated.matchedCount > 0;
}
