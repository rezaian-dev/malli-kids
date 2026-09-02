"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { replyTicket, type Ticket } from "@/lib/tickets";

/** 💬 An expanded ticket's reply thread + the "reply as user" composer. */
export function TicketThread({ ticket }: { ticket: Ticket }) {
  const [reply, setReply] = useState("");

  function send() {
    const text = reply.trim();
    if (text.length < 2) return;
    replyTicket(ticket.id, "user", text);
    setReply("");
  }

  return (
    <div
      className={cn(
        "space-y-3 border-t px-4 py-4",
        "border-navy/8 bg-navy/2",
        "dark:border-gold/15 dark:bg-white/2",
      )}
    >
      {ticket.replies.map((replyItem, index) => (
        <div
          key={index}
          className={cn(
            "flex",
            replyItem.from === "support" ? "justify-end" : "justify-start",
          )}
        >
          <div
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7",
              replyItem.from === "support"
                ? "border-gold/30 bg-gold/10 text-navy dark:text-ivory rounded-se-md border"
                : "border-navy/10 text-navy dark:bg-dusk-mid dark:text-linen rounded-ss-md border bg-white dark:border-white/10",
            )}
          >
            <p className="text-gold mb-1 text-[10px] font-black">
              {replyItem.from === "support" ? "پشتیبانی" : "شما"}
            </p>
            <p className="whitespace-pre-wrap">{replyItem.text}</p>
            <p className="text-navy/70 dark:text-wheat mt-1.5 text-[10px] font-bold">
              {replyItem.at}
            </p>
          </div>
        </div>
      ))}

      <div className="flex gap-2 pt-1">
        <input
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            send();
          }}
          placeholder="پیام پیگیری…"
          className={cn(
            "h-10 flex-1 rounded-xl border bg-white px-4 text-sm outline-none",
            "border-navy/12 text-navy",
            "dark:border-gold/25 dark:bg-navy-mid dark:text-ivory",
          )}
        />
        <Button
          type="button"
          variant="navy"
          size="icon"
          className="size-10 shrink-0 rounded-xl"
          onClick={send}
          aria-label="ارسال پیام"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
