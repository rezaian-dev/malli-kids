import {
  CheckCheck,
  CircleAlert,
  LockKeyhole,
  LockKeyholeOpen,
  Mail,
  Reply,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import type { Ticket, TicketStatus } from "@/lib/tickets";

const TICKET_ACTION_BUTTON =
  "min-h-9 flex-1 rounded-xl text-[10px] sm:flex-none";

const QUICK_REPLIES = [
  "سلام، ممنون از پیام شما.",
  "شماره سفارش را لطفاً ارسال کنید.",
  "موضوع در حال بررسی است و به‌زودی اطلاع می‌دهیم.",
];

const STATUS: Record<TicketStatus, { label: string; cls: string; dot: string }> = {
  open: {
    label: "در انتظار پاسخ",
    cls: "bg-rose/10 text-rose dark:bg-rose/15",
    dot: "bg-rose",
  },
  answered: {
    label: "پاسخ داده شده",
    cls: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/12 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  closed: {
    label: "بسته شده",
    cls: "bg-navy/7 text-navy/55 dark:bg-white/7 dark:text-ivory/60",
    dot: "bg-navy/35 dark:bg-white/35",
  },
};

/** 🎫 One support ticket — thread, status toggle, and (when open) the
 *  reply composer. */
export function TicketCard({
  ticket,
  replying,
  replyValue,
  onReplyChange,
  onToggleReply,
  onSend,
  onToggleStatus,
}: {
  ticket: Ticket;
  replying: boolean;
  replyValue: string;
  onReplyChange: (value: string) => void;
  onToggleReply: () => void;
  onSend: () => void;
  onToggleStatus: () => void;
}) {
  const meta = STATUS[ticket.status];
  const lastReply = ticket.replies.at(-1);

  return (
    <article
      className={cn(
        adminGlassCard,
        ticket.status === "open" && "border-rose/20 dark:border-rose/25",
      )}
    >
      <div className="p-3.5 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={cn(
                "relative grid size-10 shrink-0 place-items-center rounded-xl font-black",
                "bg-navy text-gold",
                "dark:bg-gold/15 dark:text-gold-soft",
              )}
            >
              {ticket.name.charAt(0)}
              <span
                className={cn(
                  "dark:border-navy-mid absolute -inset-e-0.5 -top-0.5 size-2.5 rounded-full border-2 border-white",
                  meta.dot,
                )}
              />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-navy dark:text-ivory font-black">
                  {ticket.name}
                </p>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-black",
                    meta.cls,
                  )}
                >
                  {ticket.status === "open" ? (
                    <CircleAlert className="size-3" />
                  ) : ticket.status === "answered" ? (
                    <CheckCheck className="size-3" />
                  ) : (
                    <LockKeyhole className="size-3" />
                  )}
                  {meta.label}
                </span>
              </div>
              <h2 className="text-navy/78 dark:text-ivory/78 mt-1 text-sm font-black">
                {ticket.subject}
              </h2>
              <p
                className="text-navy/40 dark:text-wheat mt-1 truncate text-[10px] font-bold"
                dir="ltr"
              >
                {ticket.owner}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-between gap-3 sm:block sm:text-end">
            <p className="text-navy/40 dark:text-wheat text-[10px] font-bold">
              {ticket.createdAt}
            </p>
            <p className="text-navy/35 dark:text-wheat/55 mt-1 text-[9px] font-black">
              {ticket.replies.length} پیام
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {ticket.replies.map((item, replyIndex) => (
            <div
              key={`${item.at}-${replyIndex}`}
              className={cn(
                "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-xs leading-6 sm:max-w-[82%]",
                item.from === "support"
                  ? "border-gold/18 bg-gold/8 text-navy dark:text-ivory ms-auto border"
                  : "bg-navy/4.5 text-navy/80 dark:text-ivory/80 me-auto dark:bg-white/4",
              )}
            >
              <div className="mb-0.5 flex items-center justify-between gap-4 text-[9px] font-black">
                <span
                  className={
                    item.from === "support"
                      ? "text-gold-deep dark:text-gold-soft"
                      : "text-navy/45 dark:text-wheat"
                  }
                >
                  {item.from === "support" ? "پشتیبانی ملی‌کیدز" : "کاربر"}
                </span>
                <span className="text-navy/30 dark:text-wheat/45 font-bold">
                  {item.at}
                </span>
              </div>
              <p>{item.text}</p>
            </div>
          ))}
        </div>

        <div className="border-navy/6 dark:border-gold/12 mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
          <p className="text-navy/35 dark:text-wheat/55 hidden text-[9px] font-bold sm:block">
            آخرین پیام: {lastReply?.from === "support" ? "پشتیبانی" : "کاربر"}
          </p>
          <div className="ms-auto flex w-full gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={TICKET_ACTION_BUTTON}
              onClick={onToggleStatus}
            >
              {ticket.status === "closed" ? (
                <LockKeyholeOpen className="size-3.5" />
              ) : (
                <LockKeyhole className="size-3.5" />
              )}{" "}
              {ticket.status === "closed" ? "بازکردن" : "بستن"}
            </Button>
            <Button
              type="button"
              variant={replying ? "outline" : "navy"}
              size="sm"
              className={TICKET_ACTION_BUTTON}
              onClick={onToggleReply}
            >
              <Reply className="size-3.5" /> {replying ? "انصراف" : "ثبت پاسخ"}
            </Button>
          </div>
        </div>
      </div>

      {replying ? (
        <div className="border-navy/7 bg-navy/2 dark:border-gold/12 border-t p-3.5 sm:p-5 dark:bg-white/2">
          <label
            className="text-gold mb-2 flex items-center gap-1.5 text-[11px] font-black"
            htmlFor={`reply-${ticket.id}`}
          >
            <Mail className="size-3.5" /> پاسخ به {ticket.name}
          </label>
          <div className="mb-2 flex scrollbar-none gap-1.5 overflow-x-auto pb-1">
            {QUICK_REPLIES.map((text) => (
              <button
                key={text}
                type="button"
                onClick={() =>
                  onReplyChange(replyValue ? `${replyValue}\n${text}` : text)
                }
                className={cn(
                  "shrink-0 rounded-xl border bg-white/70 px-3 py-1.5 text-[10px] font-bold transition",
                  "border-navy/8 text-navy/60 hover:border-gold/40",
                  "dark:border-gold/14 dark:bg-navy-deep/35 dark:text-wheat",
                )}
              >
                {text}
              </button>
            ))}
          </div>
          <Textarea
            id={`reply-${ticket.id}`}
            value={replyValue}
            onChange={(event) => onReplyChange(event.target.value)}
            placeholder="پاسخ کامل و شفاف خود را بنویسید…"
            className="min-h-28 resize-y rounded-xl bg-transparent"
          />
          <div className="mt-2 flex justify-end">
            <Button
              type="button"
              variant="navy"
              size="sm"
              className="min-h-10 w-full rounded-xl sm:w-auto"
              onClick={onSend}
            >
              <Send className="size-4" /> ارسال پاسخ
            </Button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
