"use client";

import { faNow } from "./format";
import { createLocalList } from "./local-store";
import { notify } from "./notifications";

export type TicketStatus = "open" | "answered" | "closed";

export type TicketReply = {
  from: "user" | "support";
  text: string;
  at: string;
};

export type Ticket = {
  id: string;

  owner: string;
  name: string;
  subject: string;
  status: TicketStatus;
  createdAt: string;

  replies: TicketReply[];
};

const tickets = createLocalList<Ticket>("malli_tickets", "tickets:change");

export const loadTickets = tickets.load;

export function createTicket(input: {
  owner: string;
  name: string;
  subject: string;
  message: string;
}): Ticket {
  const at = faNow();
  const ticket: Ticket = {
    id: `t-${Date.now().toString(36)}`,
    owner: input.owner,
    name: input.name,
    subject: input.subject.trim(),
    status: "open",
    createdAt: at,
    replies: [{ from: "user", text: input.message.trim(), at }],
  };
  tickets.persist([ticket, ...tickets.load()]);
  return ticket;
}

export function replyTicket(
  id: string,
  from: "user" | "support",
  text: string,
) {
  const at = faNow();
  if (from === "support") {
    const t = tickets.load().find((x) => x.id === id);
    if (t)
      notify(
        t.owner,
        "ticket",
        `به تیکت «${t.subject}» پاسخ داده شد؛ پاسخ را در پنل خودتان ببینید.`,
      );
  }
  tickets.persist(
    tickets.load().map((t) =>
      t.id === id
        ? {
            ...t,
            replies: [...t.replies, { from, text: text.trim(), at }],
            status:
              from === "support" ? ("answered" as const) : ("open" as const),
          }
        : t,
    ),
  );
}

export function setTicketStatus(id: string, status: TicketStatus) {
  tickets.persist(
    tickets.load().map((t) => (t.id === id ? { ...t, status } : t)),
  );
}

export function useTickets(owner?: string): Ticket[] {
  const all = tickets.useList();
  if (!owner) return all;
  return all.filter((t) => t.owner === owner);
}
