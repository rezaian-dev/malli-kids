"use client";

import { useEffect, useState } from "react";
import { faNow } from "./format";
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

const KEY = "malli_tickets";
const EVENT = "tickets:change";

export function loadTickets(): Ticket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Ticket[]) : [];
  } catch {
    return [];
  }
}

function persist(list: Ticket[]) {
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export { faNow };

export function createTicket(input: { owner: string; name: string; subject: string; message: string }): Ticket {
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
  persist([ticket, ...loadTickets()]);
  return ticket;
}

export function replyTicket(id: string, from: "user" | "support", text: string) {
  const at = faNow();
  if (from === "support") {
    const t = loadTickets().find((x) => x.id === id);
    if (t) notify(t.owner, "ticket", `به تیکت «${t.subject}» پاسخ داده شد؛ پاسخ را در پنل خودتان ببینید.`);
  }
  persist(
    loadTickets().map((t) =>
      t.id === id
        ? {
            ...t,
            replies: [...t.replies, { from, text: text.trim(), at }],
            status: from === "support" ? ("answered" as const) : ("open" as const),
          }
        : t,
    ),
  );
}

export function setTicketStatus(id: string, status: TicketStatus) {
  persist(loadTickets().map((t) => (t.id === id ? { ...t, status } : t)));
}

export function useTickets(owner?: string): Ticket[] {
  const [all, setAll] = useState<Ticket[]>([]);

  useEffect(() => {
    const sync = () => setAll(loadTickets());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!owner) return all;
  return all.filter((t) => t.owner === owner);
}
