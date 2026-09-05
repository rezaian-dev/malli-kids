import { isValidObjectId } from "mongoose";
import { connectMongoose } from "@/lib/db/mongoose";
import {
  ChatConversationModel,
  ChatMessageModel,
  type ChatMessageDoc,
  type ChatSenderRole,
  type ChatStatus,
  type ConversationDoc,
} from "@/lib/db/models/chat";
import { faDateTime } from "@/lib/locale/fa";

export type { ChatStatus };

export type ChatConversation = {
  id: string;
  customerId: string;
  customerName: string;
  assignedAdminId?: string;
  status: ChatStatus;
  lastMessageAt: string;
  lastMessagePreview: string;
  customerUnreadCount: number;
  adminUnreadCount: number;
  customerTyping: boolean;
  adminTyping: boolean;
  rating?: number;
  ratedAt?: string;
  escalatedTicketNumber?: number;
  page?: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  senderRole: ChatSenderRole;
  body: string;
  at: string;
};

// ✂️ The real ceiling; the client's maxLength attribute just mirrors it.
export const CHAT_MESSAGE_MAX_LEN = 1000;

const PREVIEW_LEN = 80;
// 🧊 Hard cap keeps a runaway conversation from turning the 4s poll into a heavyweight query.
const MESSAGE_LIMIT = 200;
const CONVERSATION_LIMIT = 100;

type ConversationLean = ConversationDoc & {
  _id: { toString(): string };
  createdAt: Date;
  updatedAt: Date;
};

type MessageLean = ChatMessageDoc & {
  _id: { toString(): string };
  createdAt: Date;
};

// ⌨️ 6s window — longer than the 4s poll, short enough that a closed tab clears almost immediately.
const TYPING_WINDOW_MS = 6_000;

function isTyping(at?: Date): boolean {
  return !!at && Date.now() - new Date(at).getTime() < TYPING_WINDOW_MS;
}

function toConversation(doc: ConversationLean): ChatConversation {
  return {
    id: doc._id.toString(),
    customerId: doc.customerId,
    customerName: doc.customerName,
    assignedAdminId: doc.assignedAdminId,
    status: doc.status,
    lastMessageAt: faDateTime(doc.lastMessageAt),
    lastMessagePreview: doc.lastMessagePreview,
    customerUnreadCount: doc.customerUnreadCount,
    adminUnreadCount: doc.adminUnreadCount,
    customerTyping: isTyping(doc.customerTypingAt),
    adminTyping: isTyping(doc.adminTypingAt),
    rating: doc.rating,
    ratedAt: doc.ratedAt ? faDateTime(doc.ratedAt) : undefined,
    escalatedTicketNumber: doc.escalatedTicketNumber,
    page: doc.page,
    createdAt: faDateTime(doc.createdAt),
  };
}

function toMessage(doc: MessageLean): ChatMessage {
  return {
    id: doc._id.toString(),
    senderRole: doc.senderRole,
    body: doc.body,
    at: faDateTime(doc.createdAt),
  };
}

function isDuplicateKey(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: number }).code === 11000
  );
}

// 🧵 Opening the chat window never creates a row by itself; the first message does.
export async function getOpenConversationForCustomer(
  customerId: string,
): Promise<ChatConversation | null> {
  await connectMongoose();
  const doc = await ChatConversationModel.findOne({
    customerId,
    status: { $in: ["open", "active"] },
  })
    .sort({ updatedAt: -1 })
    .lean<ConversationLean | null>();
  return doc ? toConversation(doc) : null;
}

export async function getChatMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  if (!isValidObjectId(conversationId)) return [];
  await connectMongoose();
  const docs = await ChatMessageModel.find({ conversationId })
    .sort({ createdAt: 1, _id: 1 })
    .limit(MESSAGE_LIMIT)
    .lean<MessageLean[]>();
  return docs.map(toMessage);
}

// ✉️ Finds the live thread or creates one; a message after a close starts a fresh thread.
export async function customerSendMessage(input: {
  customerId: string;
  customerName: string;
  page?: string;
  body: string;
  clientId: string;
}): Promise<{ conversation: ChatConversation; message: ChatMessage }> {
  await connectMongoose();
  const text = input.body.trim().slice(0, CHAT_MESSAGE_MAX_LEN);

  let doc = await ChatConversationModel.findOne({
    customerId: input.customerId,
    status: { $in: ["open", "active"] },
  });
  if (!doc) {
    try {
      doc = await ChatConversationModel.create({
        customerId: input.customerId,
        customerName: input.customerName,
        page: input.page,
        status: "open",
      });
    } catch (error) {
      // 🏁 Lost a same-millisecond race — re-read the winner instead of failing.
      if (!isDuplicateKey(error)) throw error;
      doc = await ChatConversationModel.findOne({
        customerId: input.customerId,
        status: { $in: ["open", "active"] },
      });
      if (!doc) throw error;
    }
  }

  try {
    const created = await ChatMessageModel.create({
      conversationId: doc._id.toString(),
      senderId: input.customerId,
      senderRole: "customer",
      body: text,
      clientId: input.clientId,
    });
    const now = new Date();
    const updated = await ChatConversationModel.findByIdAndUpdate(
      doc._id,
      {
        $set: {
          status: "open",
          lastMessagePreview: text.slice(0, PREVIEW_LEN),
          lastMessageAt: now,
        },
        $inc: { adminUnreadCount: 1 },
        $unset: { customerTypingAt: "" },
      },
      { new: true },
    ).lean<ConversationLean>();
    if (!updated) throw new Error("chat conversation vanished mid-send");
    return {
      conversation: toConversation(updated),
      message: toMessage(created.toObject() as MessageLean),
    };
  } catch (error) {
    // 🔁 Same clientId as a stored message — a retry; return the original without touching unread counts.
    if (!isDuplicateKey(error)) throw error;
    const existing = await ChatMessageModel.findOne({
      conversationId: doc._id.toString(),
      clientId: input.clientId,
    }).lean<MessageLean>();
    if (!existing) throw error;
    const current = await ChatConversationModel.findById(
      doc._id,
    ).lean<ConversationLean>();
    if (!current) throw error;
    return {
      conversation: toConversation(current),
      message: toMessage(existing),
    };
  }
}

// 🛎️ Auto-claims an unassigned thread; replying to a closed thread reopens it as active.
export async function adminSendMessage(input: {
  conversationId: string;
  adminId: string;
  body: string;
  clientId: string;
}): Promise<{ conversation: ChatConversation; message: ChatMessage } | null> {
  if (!isValidObjectId(input.conversationId)) return null;
  await connectMongoose();
  const text = input.body.trim().slice(0, CHAT_MESSAGE_MAX_LEN);

  const doc = await ChatConversationModel.findById(input.conversationId);
  if (!doc) return null;

  try {
    const created = await ChatMessageModel.create({
      conversationId: doc._id.toString(),
      senderId: input.adminId,
      senderRole: "admin",
      body: text,
      clientId: input.clientId,
    });
    const now = new Date();
    const updated = await ChatConversationModel.findByIdAndUpdate(
      doc._id,
      {
        $set: {
          status: "active",
          lastMessagePreview: text.slice(0, PREVIEW_LEN),
          lastMessageAt: now,
          ...(doc.assignedAdminId ? {} : { assignedAdminId: input.adminId }),
        },
        $inc: { customerUnreadCount: 1 },
        $unset: { adminTypingAt: "" },
      },
      { new: true },
    ).lean<ConversationLean>();
    if (!updated) throw new Error("chat conversation vanished mid-send");
    return {
      conversation: toConversation(updated),
      message: toMessage(created.toObject() as MessageLean),
    };
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
    const existing = await ChatMessageModel.findOne({
      conversationId: doc._id.toString(),
      clientId: input.clientId,
    }).lean<MessageLean>();
    if (!existing) throw error;
    const current = await ChatConversationModel.findById(
      doc._id,
    ).lean<ConversationLean>();
    if (!current) throw error;
    return {
      conversation: toConversation(current),
      message: toMessage(existing),
    };
  }
}

// 👀 Ownership is part of the filter, so a forged id clears nothing.
export async function markChatReadAsCustomer(
  conversationId: string,
  customerId: string,
): Promise<boolean> {
  if (!isValidObjectId(conversationId)) return false;
  await connectMongoose();
  const conv = await ChatConversationModel.findOneAndUpdate(
    { _id: conversationId, customerId, customerUnreadCount: { $gt: 0 } },
    { $set: { customerUnreadCount: 0 } },
  );
  if (!conv) return false;
  await ChatMessageModel.updateMany(
    { conversationId: conv._id.toString(), senderRole: "admin", readAt: null },
    { $set: { readAt: new Date() } },
  );
  return true;
}

export async function markChatReadAsAdmin(
  conversationId: string,
): Promise<boolean> {
  if (!isValidObjectId(conversationId)) return false;
  await connectMongoose();
  const conv = await ChatConversationModel.findOneAndUpdate(
    { _id: conversationId, adminUnreadCount: { $gt: 0 } },
    { $set: { adminUnreadCount: 0 } },
  );
  if (!conv) return false;
  await ChatMessageModel.updateMany(
    {
      conversationId: conv._id.toString(),
      senderRole: "customer",
      readAt: null,
    },
    { $set: { readAt: new Date() } },
  );
  return true;
}

/** 📥 Newest activity first — the admin inbox order. */
export async function getChatConversationsForAdmin(): Promise<
  ChatConversation[]
> {
  await connectMongoose();
  const docs = await ChatConversationModel.find()
    .sort({ lastMessageAt: -1 })
    .limit(CONVERSATION_LIMIT)
    .lean<ConversationLean[]>();
  return docs.map(toConversation);
}

export async function getChatThreadForAdmin(conversationId: string): Promise<{
  conversation: ChatConversation;
  messages: ChatMessage[];
} | null> {
  if (!isValidObjectId(conversationId)) return null;
  await connectMongoose();
  const conv =
    await ChatConversationModel.findById(
      conversationId,
    ).lean<ConversationLean>();
  if (!conv) return null;
  const messages = await getChatMessages(conversationId);
  return { conversation: toConversation(conv), messages };
}

export async function setChatStatus(
  conversationId: string,
  status: ChatStatus,
): Promise<boolean> {
  if (!isValidObjectId(conversationId)) return false;
  await connectMongoose();
  const updated = await ChatConversationModel.updateOne(
    { _id: conversationId },
    { $set: { status } },
  );
  return updated.matchedCount > 0;
}

// ⌨️ Ownership is part of the filter, so a forged id stamps nothing.
export async function setTypingAsCustomer(
  conversationId: string,
  customerId: string,
): Promise<void> {
  if (!isValidObjectId(conversationId)) return;
  await connectMongoose();
  await ChatConversationModel.updateOne(
    { _id: conversationId, customerId },
    { $set: { customerTypingAt: new Date() } },
  );
}

export async function setTypingAsAdmin(conversationId: string): Promise<void> {
  if (!isValidObjectId(conversationId)) return;
  await connectMongoose();
  await ChatConversationModel.updateOne(
    { _id: conversationId },
    { $set: { adminTypingAt: new Date() } },
  );
}

// ⭐ Re-rating overwrites, so the latest sentiment wins.
export async function submitChatRating(
  conversationId: string,
  customerId: string,
  stars: number,
  note?: string,
): Promise<boolean> {
  if (!isValidObjectId(conversationId) || stars < 1 || stars > 5) return false;
  await connectMongoose();
  const updated = await ChatConversationModel.updateOne(
    { _id: conversationId, customerId },
    {
      $set: {
        rating: stars,
        ratedAt: new Date(),
        ratingNote: (note ?? "").trim().slice(0, 500),
      },
    },
  );
  return updated.matchedCount > 0;
}

export async function setChatAssignee(
  conversationId: string,
  adminId: string | null,
): Promise<boolean> {
  if (!isValidObjectId(conversationId)) return false;
  await connectMongoose();
  const updated = await ChatConversationModel.updateOne(
    { _id: conversationId },
    adminId
      ? { $set: { assignedAdminId: adminId } }
      : { $unset: { assignedAdminId: "" } },
  );
  return updated.matchedCount > 0;
}

// 🎫 Idempotent — re-escalating returns the original ticket instead of forking a second one.
export async function escalateChatToTicket(
  conversationId: string,
  customerId: string,
): Promise<{ ticketId: string; number?: number } | null> {
  if (!isValidObjectId(conversationId)) return null;
  await connectMongoose();
  const conv = await ChatConversationModel.findOne({
    _id: conversationId,
    customerId,
  }).lean<ConversationLean | null>();
  if (!conv) return null;
  if (conv.escalatedTicketId) {
    return {
      ticketId: conv.escalatedTicketId,
      number: conv.escalatedTicketNumber,
    };
  }
  const messages = await getChatMessages(conversationId);
  const transcript =
    messages
      .map(
        (message) =>
          `${message.senderRole === "customer" ? "مشتری" : "پشتیبانی"}: ${message.body}`,
      )
      .join("\n")
      .slice(0, 2000) || "(بدون پیام)";
  const { createTicket } = await import("./tickets");
  const ticket = await createTicket({
    userId: customerId,
    name: conv.customerName,
    subject: `گفتگوی زنده — ${conv.customerName}`,
    message: transcript,
    category: "other",
    priority: "normal",
  });
  await ChatConversationModel.updateOne(
    { _id: conversationId },
    {
      $set: {
        escalatedTicketId: ticket.id,
        escalatedTicketNumber: ticket.number,
      },
    },
  );
  return { ticketId: ticket.id, number: ticket.number };
}
