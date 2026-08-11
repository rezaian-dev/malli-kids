import { connectMongoose } from "@/lib/db/mongoose";
import { getNextSequence } from "@/lib/db/models/counter";
import {
  TicketModel,
  type TicketCategory,
  type TicketDoc,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/db/models/ticket";
import { faDateTime } from "@/lib/locale/fa";

export type { TicketStatus, TicketCategory, TicketPriority };
export type TicketReply = {
  from: "user" | "support";
  text: string;
  at: string;
};
export type Ticket = {
  id: string;
  userId: string;
  name: string;
  subject: string;
  status: TicketStatus;
  category: TicketCategory;
  priority: TicketPriority;
  number?: number;
  assigneeId?: string;
  assigneeName?: string;
  createdAt: string;
  /** ⏳ Whole hours since the customer's last message while the ticket
   *  waits on support (`open`); `null` otherwise — drives the \"waiting\"
   *  chip, computed server-side so every surface agrees. */
  waitingHours: number | null;
  replies: TicketReply[];
};

export const TICKET_CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: "order", label: "پیگیری سفارش" },
  { value: "return", label: "مرجوعی و تعویض" },
  { value: "sizing", label: "راهنمای سایز" },
  { value: "quality", label: "کیفیت محصول" },
  { value: "other", label: "سایر" },
];

export const TICKET_PRIORITIES: { value: TicketPriority; label: string }[] = [
  { value: "normal", label: "عادی" },
  { value: "high", label: "مهم" },
  { value: "urgent", label: "فوری" },
];

export function ticketCategoryLabel(category: TicketCategory): string {
  return (
    TICKET_CATEGORIES.find((c) => c.value === category)?.label ?? "سایر"
  );
}

export function ticketPriorityLabel(priority: TicketPriority): string {
  return TICKET_PRIORITIES.find((p) => p.value === priority)?.label ?? "عادی";
}

/** #️⃣ Stable display number — the serial for new tickets, a short-id
 *  fallback for rows that predate numbering. */
export function ticketNumber(ticket: { number?: number; id: string }): string {
  return ticket.number ? `#${ticket.number}` : `#${ticket.id.slice(-6)}`;
}

function toTicket(
  doc: TicketDoc & {
    _id: { toString(): string };
    createdAt: Date;
    updatedAt: Date;
  },
): Ticket {
  let waitingHours: number | null = null;
  if (doc.status === "open") {
    const lastUser = [...doc.replies].reverse().find((r) => r.from === "user");
    const since = lastUser?.at ?? doc.createdAt;
    waitingHours = Math.max(
      0,
      Math.floor((Date.now() - new Date(since).getTime()) / 3_600_000),
    );
  }
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    name: doc.name,
    subject: doc.subject,
    status: doc.status,
    // 🕰️ Rows created before the standard pack lack these — same defaults
    // the schema gives new rows.
    category: doc.category ?? "other",
    priority: doc.priority ?? "normal",
    number: doc.number,
    assigneeId: doc.assigneeId,
    assigneeName: doc.assigneeName,
    createdAt: faDateTime(doc.createdAt),
    waitingHours,
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
  const docs = await TicketModel.find({ userId })
    .sort({ updatedAt: -1 })
    .lean();
  return docs.map(toTicket);
}

export async function createTicket(input: {
  userId: string;
  name: string;
  subject: string;
  message: string;
  category?: TicketCategory;
  priority?: TicketPriority;
}): Promise<Ticket> {
  await connectMongoose();
  const doc = await TicketModel.create({
    userId: input.userId,
    name: input.name,
    subject: input.subject.trim(),
    status: "open",
    category: input.category ?? "other",
    priority: input.priority ?? "normal",
    number: await getNextSequence("ticket", 1001),
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
  const updated = await TicketModel.updateOne(
    { _id: id },
    { $set: { status } },
  );
  return updated.matchedCount > 0;
}

/** 🗂️ Category / priority / assignee upkeep — each field optional; pass
 *  `assigneeId: null` to unassign. */
export async function setTicketMeta(
  id: string,
  patch: {
    category?: TicketCategory;
    priority?: TicketPriority;
    assigneeId?: string | null;
    assigneeName?: string | null;
  },
): Promise<boolean> {
  await connectMongoose();
  const $set: Record<string, unknown> = {};
  const $unset: Record<string, unknown> = {};
  if (patch.category) $set.category = patch.category;
  if (patch.priority) $set.priority = patch.priority;
  if (patch.assigneeId === null) {
    $unset.assigneeId = "";
    $unset.assigneeName = "";
  } else if (patch.assigneeId) {
    $set.assigneeId = patch.assigneeId;
    $set.assigneeName = patch.assigneeName ?? "";
  }
  const updated = await TicketModel.updateOne(
    { _id: id },
    { $set, ...(Object.keys($unset).length ? { $unset } : {}) },
  );
  return updated.matchedCount > 0;
}

/** 🙋 First support reply auto-claims an unassigned ticket (same rule as
 *  live-chat threads) — the assignee filter never lies about ownership. */
export async function claimTicketIfUnassigned(
  id: string,
  adminId: string,
  adminName: string,
): Promise<void> {
  await connectMongoose();
  await TicketModel.updateOne(
    { _id: id, $or: [{ assigneeId: { $exists: false } }, { assigneeId: "" }] },
    { $set: { assigneeId: adminId, assigneeName: adminName } },
  );
}
