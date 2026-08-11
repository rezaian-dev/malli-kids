"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { getSession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/action-result";
import {
  DEFAULT_SUPPORT_HOURS,
  getSupportHours,
  type SupportHours,
} from "./settings";
import {
  adminSendMessage,
  CHAT_MESSAGE_MAX_LEN,
  customerSendMessage,
  getChatConversationsForAdmin,
  getChatMessages,
  getChatThreadForAdmin,
  escalateChatToTicket,
  getOpenConversationForCustomer,
  markChatReadAsAdmin,
  markChatReadAsCustomer,
  setChatStatus,
  setTypingAsAdmin,
  setTypingAsCustomer,
  submitChatRating,
  type ChatConversation,
  type ChatMessage,
  type ChatStatus,
} from "./chat";

const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const AUTH_ERROR = "برای این کار باید وارد حساب‌تان باشید.";
const ADMIN_AUTH_ERROR = "برای این کار باید ادمین وارد شده باشید.";
const TOO_FAST_ERROR = "پیام‌ها کمی سریع ارسال شدند؛ چند لحظه صبر کنید.";

export type ChatThread = {
  conversation: ChatConversation | null;
  messages: ChatMessage[];
};

async function requireUser() {
  const session = await getSession();
  if (!session?.user) return null;
  return { id: session.user.id, name: session.user.name };
}

// 🧭 The storefront path the chat started from (`/product/…`) — context
// only, and only accepted in the shape a real path has.
function cleanPage(page: unknown): string | undefined {
  if (typeof page !== "string") return undefined;
  const trimmed = page.trim().slice(0, 120);
  return trimmed.startsWith("/") ? trimmed : undefined;
}

function cleanBody(body: unknown): string | null {
  if (typeof body !== "string") return null;
  const text = body.trim();
  if (!text || text.length > CHAT_MESSAGE_MAX_LEN) return null;
  return text;
}

function cleanClientId(clientId: unknown): string | null {
  if (typeof clientId !== "string") return null;
  const trimmed = clientId.trim().slice(0, 64);
  return trimmed ? trimmed : null;
}

// ─── Customer ─────────────────────────────────────────────────────

/** 💬 One round trip for the whole chat window — the thread plus its
 *  messages, polled while the window is open. Ownership is implicit: the
 *  query is keyed by the session's own user id, so there is no id for a
 *  client to forge. */
export async function getMyChatAction(): Promise<ChatThread> {
  const user = await requireUser();
  if (!user) return { conversation: null, messages: [] };
  const conversation = await getOpenConversationForCustomer(user.id);
  if (!conversation) return { conversation: null, messages: [] };
  return {
    conversation,
    messages: await getChatMessages(conversation.id),
  };
}

/** 🔴 One indexed document read — feeds the unread badge on the chat
 *  bubble while the window is closed (same 8s rhythm as the header
 *  bells). The window's own poll takes over while it's open. */
export async function getMyChatUnreadAction(): Promise<number> {
  const user = await requireUser();
  if (!user) return 0;
  const conversation = await getOpenConversationForCustomer(user.id);
  return conversation?.customerUnreadCount ?? 0;
}

export async function sendChatMessageAction(input: {
  body: string;
  clientId: string;
  page?: string;
}): Promise<ActionResult<ChatThread>> {
  const body = cleanBody(input.body);
  const clientId = cleanClientId(input.clientId);
  if (!body || !clientId) return { ok: false, error: FALLBACK_ERROR };

  const user = await requireUser();
  if (!user) return { ok: false, error: AUTH_ERROR };

  const limited = rateLimit(`chat-send:${user.id}`, {
    windowMs: 60_000,
    max: 12,
  });
  if (!limited.ok) return { ok: false, error: TOO_FAST_ERROR };

  try {
    const { conversation } = await customerSendMessage({
      customerId: user.id,
      customerName: user.name,
      page: cleanPage(input.page),
      body,
      clientId,
    });
    return {
      ok: true,
      data: {
        conversation,
        messages: await getChatMessages(conversation.id),
      },
    };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

/** 👀 Best-effort "I saw it" — fire-and-forget like the notification
 *  mark-read actions; a failed call just leaves the count for next time. */
export async function markChatReadAction(
  conversationId: string,
): Promise<void> {
  const user = await requireUser();
  if (!user) return;
  await markChatReadAsCustomer(conversationId, user.id);
}

/** ⌨️ Typing heartbeat — fire-and-forget; throttled client-side (~one
 *  per 3s) and rate-limited here as a backstop. */
export async function pingChatTypingAction(
  conversationId: string,
): Promise<void> {
  const user = await requireUser();
  if (!user || typeof conversationId !== "string") return;
  const limited = rateLimit(`chat-typing:${user.id}`, {
    windowMs: 60_000,
    max: 30,
  });
  if (!limited.ok) return;
  await setTypingAsCustomer(conversationId, user.id);
}

/** ⭐ Rate the thread after it closes — re-rating overwrites. */
export async function submitChatRatingAction(
  conversationId: string,
  stars: number,
  note?: string,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: AUTH_ERROR };
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return { ok: false, error: FALLBACK_ERROR };
  }
  try {
    const found = await submitChatRating(conversationId, user.id, stars, note);
    if (!found) return { ok: false, error: "گفتگو پیدا نشد." };
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

/** 🎫 Turn this chat into a ticket (transcript attached) — for when the
 *  customer needs an async, trackable thread instead. */
export async function escalateChatToTicketAction(
  conversationId: string,
): Promise<ActionResult<{ number?: number }>> {
  const user = await requireUser();
  if (!user) return { ok: false, error: AUTH_ERROR };
  try {
    const result = await escalateChatToTicket(conversationId, user.id);
    if (!result) return { ok: false, error: "گفتگو پیدا نشد." };
    return { ok: true, data: { number: result.number } };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

/** 🕘 Support hours for the chat window's open/closed notice — cached
 *  like the campaign, editable in `/admin/settings`. */
export async function getSupportHoursAction(): Promise<SupportHours> {
  const user = await requireUser();
  if (!user) return DEFAULT_SUPPORT_HOURS;
  return getSupportHours();
}

// ─── Admin ────────────────────────────────────────────────────────

export async function getChatConversationsAction(): Promise<
  ChatConversation[]
> {
  const admin = await requireAdmin();
  if (!admin) return [];
  return getChatConversationsForAdmin();
}

export async function getChatThreadAction(
  conversationId: string,
): Promise<ChatThread | null> {
  const admin = await requireAdmin();
  if (!admin) return null;
  const thread = await getChatThreadForAdmin(conversationId);
  if (!thread) return null;
  return { conversation: thread.conversation, messages: thread.messages };
}

export async function sendChatReplyAction(input: {
  conversationId: string;
  body: string;
  clientId: string;
}): Promise<ActionResult<ChatThread>> {
  const body = cleanBody(input.body);
  const clientId = cleanClientId(input.clientId);
  if (!body || !clientId || typeof input.conversationId !== "string") {
    return { ok: false, error: FALLBACK_ERROR };
  }

  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: ADMIN_AUTH_ERROR };
  const session = await getSession();
  const adminId = session?.user.id;
  if (!adminId) return { ok: false, error: ADMIN_AUTH_ERROR };

  const limited = rateLimit(`chat-send-admin:${adminId}`, {
    windowMs: 60_000,
    max: 30,
  });
  if (!limited.ok) return { ok: false, error: TOO_FAST_ERROR };

  try {
    const sent = await adminSendMessage({
      conversationId: input.conversationId,
      adminId,
      body,
      clientId,
    });
    if (!sent) return { ok: false, error: "گفتگو پیدا نشد." };

    // 🔕 Deliberately NO header-bell notification — the bell is reserved
    // for ticket replies and order status; a support reply surfaces as a
    // badge on the chat bubble itself (see `getMyChatUnreadAction`).

    return {
      ok: true,
      data: {
        conversation: sent.conversation,
        messages: await getChatMessages(sent.conversation.id),
      },
    };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function setChatStatusAction(
  conversationId: string,
  status: ChatStatus,
): Promise<ActionResult> {
  if (!["open", "active", "closed"].includes(status)) {
    return { ok: false, error: FALLBACK_ERROR };
  }
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: ADMIN_AUTH_ERROR };

  try {
    const found = await setChatStatus(conversationId, status);
    if (!found) return { ok: false, error: "گفتگو پیدا نشد." };
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function markChatReadAsAdminAction(
  conversationId: string,
): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;
  await markChatReadAsAdmin(conversationId);
}

export async function pingChatTypingAsAdminAction(
  conversationId: string,
): Promise<void> {
  const admin = await requireAdmin();
  if (!admin || typeof conversationId !== "string") return;
  await setTypingAsAdmin(conversationId);
}
