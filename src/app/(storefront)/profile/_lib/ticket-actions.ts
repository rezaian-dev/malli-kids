"use server";

import type { ActionResult } from "@/lib/action-result";
import {
  createTicket,
  getTicketsForUser,
  replyTicket,
  type Ticket,
  type TicketCategory,
  type TicketPriority,
} from "@/lib/shop/tickets";
import { AUTH_ERROR, FALLBACK_ERROR, requireSessionUser, requireUserId } from "./shared";

export async function getMyTicketsAction(): Promise<Ticket[]> {
  const userId = await requireUserId();
  if (!userId) return [];
  return getTicketsForUser(userId);
}

const TICKET_CATEGORIES: TicketCategory[] = [
  "order",
  "return",
  "sizing",
  "quality",
  "other",
];
const TICKET_PRIORITIES: TicketPriority[] = ["normal", "high", "urgent"];

export async function createTicketAction(input: {
  subject: string;
  message: string;
  category?: TicketCategory;
  priority?: TicketPriority;
}): Promise<ActionResult<Ticket>> {
  if (input.subject.trim().length < 3) {
    return { ok: false, error: "موضوع باید حداقل ۳ حرف باشد." };
  }
  if (input.message.trim().length < 10) {
    return { ok: false, error: "پیام باید حداقل ۱۰ حرف باشد." };
  }

  const user = await requireSessionUser();
  if (!user) return { ok: false, error: AUTH_ERROR };

  try {
    const ticket = await createTicket({
      userId: user.id,
      name: user.name,
      subject: input.subject,
      message: input.message,
      category: TICKET_CATEGORIES.includes(input.category as TicketCategory)
        ? input.category
        : "other",
      priority: TICKET_PRIORITIES.includes(input.priority as TicketPriority)
        ? input.priority
        : "normal",
    });
    return { ok: true, data: ticket };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function replyTicketAsUserAction(
  id: string,
  text: string,
): Promise<ActionResult> {
  if (text.trim().length < 2) return { ok: false, error: "پیام را بنویسید." };

  const userId = await requireUserId();
  if (!userId) return { ok: false, error: AUTH_ERROR };

  try {
    // 🔐 Scoped to `userId` — a signed-in user can only reply on their own
    // ticket, never one they merely guessed the id of.
    const found = await replyTicket(id, "user", text, { userId });
    if (!found) return { ok: false, error: "تیکت پیدا نشد." };
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
