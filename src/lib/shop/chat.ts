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

// The real ceiling; the client's maxLength attribute just mirrors it.
export const CHAT_MESSAGE_MAX_LEN = 1000;

const PREVIEW_LEN = 80;
// Hard cap keeps a runaway conversation from turning the 4s poll into a heavyweight query.
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

// Keep typing visible longer than one polling interval.
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

// Opening the chat window never creates a row by itself; the first message does.
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

export async function getChatMessages(conversationId: string): Promise<ChatMessage[]> {
  if (!isValidObjectId(conversationId)) return [];
  await connectMongoose();
  const docs = await ChatMessageModel.find({ conversationId })
    .sort({ createdAt: 1, _id: 1 })
    .limit(MESSAGE_LIMIT)
    .lean<MessageLean[]>();
  return docs.map(toMessage);
}

// Finds the live thread or creates one; a message after a close starts a fresh thread.
type OutgoingMessage = {
  senderId: string;
  senderRole: "customer" | "admin";
  body: string;
  clientId: string;
};

async function saveMessage(
  conversation: Pick<ConversationLean, "_id" | "assignedAdminId">,
  message: OutgoingMessage,
): Promise<{ conversation: ChatConversation; message: ChatMessage }> {
  const conversationId = conversation._id.toString();
  const fromCustomer = message.senderRole === "customer";
  const unreadField = fromCustomer ? "adminUnreadCount" : "customerUnreadCount";
  const typingField = fromCustomer ? "customerTypingAt" : "adminTypingAt";

  try {
    const created = await ChatMessageModel.create({ conversationId, ...message });
    const updated = await ChatConversationModel.findByIdAndUpdate(
      conversation._id,
      {
        $set: {
          status: fromCustomer ? "open" : "active",
          lastMessagePreview: message.body.slice(0, PREVIEW_LEN),
          lastMessageAt: new Date(),
          ...(!fromCustomer && !conversation.assignedAdminId
            ? { assignedAdminId: message.senderId }
            : {}),
        },
        $inc: { [unreadField]: 1 },
        $unset: { [typingField]: "" },
      },
      { returnDocument: "after" },
    ).lean<ConversationLean>();
    if (!updated) throw new Error("chat conversation vanished mid-send");
    return {
      conversation: toConversation(updated),
      message: toMessage(created.toObject() as MessageLean),
    };
  } catch (error) {
    // Return retries without incrementing unread counts again.
    if (!isDuplicateKey(error)) throw error;
    const existing = await ChatMessageModel.findOne({
      conversationId,
      clientId: message.clientId,
    }).lean<MessageLean>();
    if (!existing) throw error;
    const current = await ChatConversationModel.findById(
      conversation._id,
    ).lean<ConversationLean>();
    if (!current) throw error;
    return { conversation: toConversation(current), message: toMessage(existing) };
  }
}

// A customer's first message creates the conversation.
export async function customerSendMessage(input: {
  customerId: string;
  customerName: string;
  page?: string;
  body: string;
  clientId: string;
}): Promise<{ conversation: ChatConversation; message: ChatMessage }> {
  await connectMongoose();
  const body = input.body.trim().slice(0, CHAT_MESSAGE_MAX_LEN);
  const filter = {
    customerId: input.customerId,
    status: { $in: ["open", "active"] as const },
  };
  let conversation = await ChatConversationModel.findOne(filter);
  if (!conversation) {
    try {
      conversation = await ChatConversationModel.create({
        customerId: input.customerId,
        customerName: input.customerName,
        page: input.page,
        status: "open",
      });
    } catch (error) {
      // Reuse the winning conversation after a concurrent insert.
      if (!isDuplicateKey(error)) throw error;
      conversation = await ChatConversationModel.findOne(filter);
      if (!conversation) throw error;
    }
  }
  return saveMessage(conversation, {
    senderId: input.customerId,
    senderRole: "customer",
    body,
    clientId: input.clientId,
  });
}

export async function adminSendMessage(input: {
  conversationId: string;
  adminId: string;
  body: string;
  clientId: string;
}): Promise<{ conversation: ChatConversation; message: ChatMessage } | null> {
  if (!isValidObjectId(input.conversationId)) return null;
  await connectMongoose();
  const body = input.body.trim().slice(0, CHAT_MESSAGE_MAX_LEN);
  const conversation = await ChatConversationModel.findById(input.conversationId);
  if (!conversation) return null;
  return saveMessage(conversation, {
    senderId: input.adminId,
    senderRole: "admin",
    body,
    clientId: input.clientId,
  });
}

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

export async function markChatReadAsAdmin(conversationId: string): Promise<boolean> {
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

/** Newest activity first — the admin inbox order. */
export async function getChatConversationsForAdmin(): Promise<ChatConversation[]> {
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
    await ChatConversationModel.findById(conversationId).lean<ConversationLean>();
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

// Ownership is part of the filter, so a forged id stamps nothing.
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

// Re-rating overwrites, so the latest sentiment wins.
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

// Reuse the linked ticket when this conversation was already escalated.
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
