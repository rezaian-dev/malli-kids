import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// Persist chat separately from asynchronous support tickets.
export type ChatStatus = "open" | "active" | "closed";
export type ChatSenderRole = "customer" | "admin";

export type ConversationDoc = {
  customerId: string;
  customerName: string;
  assignedAdminId?: string;
  status: ChatStatus;
  lastMessageAt: Date;
  lastMessagePreview: string;
  customerUnreadCount: number;
  adminUnreadCount: number;
  // Typing heartbeat; fresh (<6s) shows "در حال نوشتن" on the other side.
  customerTypingAt?: Date;
  adminTypingAt?: Date;
  // Post-close rating, customer-given.
  rating?: number;
  ratingNote?: string;
  ratedAt?: Date;
  // Escalation link — set once when the chat becomes a ticket.
  escalatedTicketId?: string;
  escalatedTicketNumber?: number;
  page?: string;
  createdAt: Date;
  updatedAt: Date;
};

const conversationSchema = new Schema<ConversationDoc>(
  {
    customerId: { type: String, required: true },
    // Snapshot at creation — avoids joining the user collection per list render.
    customerName: { type: String, required: true },
    // The first reply auto-assigns an unclaimed conversation.
    assignedAdminId: { type: String },
    status: {
      type: String,
      required: true,
      enum: ["open", "active", "closed"],
      default: "open",
    },
    lastMessageAt: { type: Date, required: true, default: Date.now },
    // Not required — mongoose would reject the "" a new conversation starts with.
    lastMessagePreview: { type: String, default: "" },
    customerUnreadCount: { type: Number, required: true, default: 0 },
    adminUnreadCount: { type: Number, required: true, default: 0 },
    customerTypingAt: { type: Date },
    adminTypingAt: { type: Date },
    rating: { type: Number, min: 1, max: 5 },
    ratingNote: { type: String },
    ratedAt: { type: Date },
    escalatedTicketId: { type: String },
    escalatedTicketNumber: { type: Number },
    // Where the chat started (e.g. /product/…) — context only.
    page: { type: String },
  },
  { timestamps: true },
);

// Supports the admin inbox's newest-activity-first list.
conversationSchema.index({ lastMessageAt: -1 });
// Enforce one live conversation per customer with a database index.
conversationSchema.index(
  { customerId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["open", "active"] } },
  },
);

export const ChatConversationModel: Model<ConversationDoc> =
  (models.ChatConversation as Model<ConversationDoc>) ||
  model<ConversationDoc>("ChatConversation", conversationSchema);

export type ChatMessageDoc = {
  conversationId: string;
  senderId: string;
  senderRole: ChatSenderRole;
  body: string;
  clientId: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const chatMessageSchema = new Schema<ChatMessageDoc>(
  {
    // Plain string like every other *Id field — the conversation's _id stringified.
    conversationId: { type: String, required: true },
    // Always derived server-side from the session — never trusted from the client.
    senderId: { type: String, required: true },
    senderRole: { type: String, required: true, enum: ["customer", "admin"] },
    body: { type: String, required: true },
    // Use the client ID to deduplicate message retries.
    clientId: { type: String, required: true },
    readAt: { type: Date },
  },
  { timestamps: true },
);

chatMessageSchema.index({ conversationId: 1, createdAt: 1 });
chatMessageSchema.index({ conversationId: 1, clientId: 1 }, { unique: true });

export const ChatMessageModel: Model<ChatMessageDoc> =
  (models.ChatMessage as Model<ChatMessageDoc>) ||
  model<ChatMessageDoc>("ChatMessage", chatMessageSchema);
