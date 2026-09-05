"use server";

import { getSession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/action-result";
import {
  DEFAULT_SUPPORT_HOURS,
  getSupportHours,
  type SupportHours,
} from "./settings";
import {
  customerSendMessage,
  getChatMessages,
  escalateChatToTicket,
  getOpenConversationForCustomer,
  markChatReadAsCustomer,
  setTypingAsCustomer,
  submitChatRating,
} from "./chat";
import {
  cleanBody,
  cleanClientId,
  cleanPage,
  FALLBACK_ERROR,
  type ChatThread,
} from "./chat-shared";

export type { ChatThread };

const AUTH_ERROR = "برای این کار باید وارد حساب‌تان باشید.";
const TOO_FAST_ERROR = "پیام‌ها کمی سریع ارسال شدند؛ چند لحظه صبر کنید.";

async function requireUser() {
  const session = await getSession();
  if (!session?.user) return null;
  return { id: session.user.id, name: session.user.name };
}

// 💬 One round trip for the whole chat window; keyed by the session's own user id, so nothing to forge.
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

// 🔴 Feeds the unread badge while the window is closed; the window's own poll takes over once open.
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

// 👀 Fire-and-forget — a failed call just leaves the count for next time.
export async function markChatReadAction(
  conversationId: string,
): Promise<void> {
  const user = await requireUser();
  if (!user) return;
  await markChatReadAsCustomer(conversationId, user.id);
}

// ⌨️ Fire-and-forget; throttled client-side (~1/3s) and rate-limited here as a backstop.
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

// 🎫 Turns the chat into a ticket with the transcript attached.
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

// 🕘 Cached like the campaign; editable in /admin/settings.
export async function getSupportHoursAction(): Promise<SupportHours> {
  const user = await requireUser();
  if (!user) return DEFAULT_SUPPORT_HOURS;
  return getSupportHours();
}
