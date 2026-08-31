"use client";

import { useState } from "react";
import { Headphones, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/providers/store-provider";
import { fullName } from "@/lib/format";
import {
  createTicket,
  replyTicket,
  useTickets,
  type Ticket,
  type TicketStatus,
} from "@/lib/tickets";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PROFILE_CARD } from "./profile-shared";

const TICKET_STATUS: Record<TicketStatus, { label: string; cls: string }> = {
  open: {
    label: "در انتظار پاسخ",
    cls: "bg-gold/15 text-gold dark:bg-gold/20 dark:text-gold-light",
  },
  answered: {
    label: "پاسخ داده شد",
    cls: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  },
  closed: {
    label: "بسته شده",
    cls: "bg-navy/8 text-navy/55 dark:bg-white/10 dark:text-ivory/55",
  },
};

function fieldClass(error?: string) {
  return [
    "w-full rounded-2xl border bg-transparent px-4 text-sm text-navy outline-none transition-[color,box-shadow,border-color] duration-200 dark:text-ivory",
    error
      ? "border-rose"
      : "border-navy/12 focus:border-gold focus:shadow-[0_18px_50px_-14px_rgba(193,147,87,0.48),0_0_0_4px_rgba(193,147,87,0.16)] dark:border-gold/25 dark:focus:shadow-[0_18px_50px_-14px_rgba(232,197,122,0.32),0_0_0_4px_rgba(232,197,122,0.16)]",
  ].join(" ");
}

// 🎫 Support panel keeps ticket logic out of the first profile paint.
export function ProfileSupportPanel() {
  const { user } = useStore();
  const owner = user?.email || user?.phone || "";
  const tickets = useTickets(owner);
  const [compose, setCompose] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ subject?: string; message?: string }>(
    {},
  );

  if (!user) return null;

  function submit() {
    const next: { subject?: string; message?: string } = {};
    if (subject.trim().length < 3)
      next.subject = "موضوع باید حداقل ۳ حرف باشد.";
    if (message.trim().length < 10)
      next.message = "پیام باید حداقل ۱۰ حرف باشد.";
    setErrors(next);
    if (Object.keys(next).length) return;

    createTicket({
      owner,
      name: fullName(user!.firstName, user!.lastName),
      subject: subject.trim(),
      message: message.trim(),
    });
    toast.success("تیکت ثبت شد — پاسخ را همین‌جا می‌بینید ✅");
    setSubject("");
    setMessage("");
    setErrors({});
    setCompose(false);
  }

  return (
    <section className={PROFILE_CARD}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-navy dark:text-linen text-lg font-black">
            تیکت‌های پشتیبانی
          </h2>
          <p className="text-navy/50 dark:text-wheat mt-1 text-xs leading-6">
            هر سوالی دارید به‌صورت تیکت بپرسید؛ پاسخ فقط در همین پنل ثبت می‌شود.
          </p>
        </div>
        {!compose ? (
          <Button
            type="button"
            variant="gold"
            size="sm"
            className="h-10 shrink-0 rounded-full px-5"
            onClick={() => setCompose(true)}
          >
            <Plus className="size-4" /> تیکت جدید
          </Button>
        ) : null}
      </div>

      {compose ? (
        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-navy/60 dark:text-wheat text-xs font-black">
              موضوع
            </span>
            <input
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                setErrors((current) => ({ ...current, subject: undefined }));
              }}
              maxLength={60}
              placeholder="سایز، سفارش…"
              className={`${fieldClass(errors.subject)} h-11`}
            />
            {errors.subject ? (
              <p className="text-rose text-xs font-bold">{errors.subject}</p>
            ) : null}
          </label>

          <label className="block space-y-1.5">
            <span className="text-navy/60 dark:text-wheat text-xs font-black">
              پیام
            </span>
            <textarea
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setErrors((current) => ({ ...current, message: undefined }));
              }}
              maxLength={600}
              placeholder="سوال‌تان را بنویسید…"
              className={`${fieldClass(errors.message)} min-h-32 py-3`}
            />
            {errors.message ? (
              <p className="text-rose text-xs font-bold">{errors.message}</p>
            ) : null}
          </label>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="navy"
              className="h-11 px-6"
              onClick={submit}
            >
              ثبت تیکت
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 px-5"
              onClick={() => setCompose(false)}
            >
              انصراف
            </Button>
          </div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="border-navy/15 dark:border-gold/25 mt-6 rounded-2xl border border-dashed px-6 py-10 text-center">
          <Headphones className="text-gold mx-auto size-9" />
          <p className="text-navy dark:text-ivory mt-3 font-black">
            هنوز تیکتی ندارید
          </p>
          <p className="text-navy/50 dark:text-wheat mx-auto mt-1 max-w-xs text-xs leading-6">
            مشاوره سایز، پیگیری سفارش یا هر سوال دیگر — تیکت بسازید تا همین‌جا
            پاسخ بگیرید.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {tickets.map((ticket) => {
            const open = openId === ticket.id;
            const status = TICKET_STATUS[ticket.status];
            return (
              <li
                key={ticket.id}
                className="border-navy/10 dark:border-gold/25 overflow-hidden rounded-2xl border"
              >
                <button
                  type="button"
                  className="hover:bg-navy/3 flex w-full items-center justify-between gap-3 px-4 py-3.5 text-start transition-colors dark:hover:bg-white/4"
                  onClick={() => setOpenId(open ? null : ticket.id)}
                  aria-expanded={open}
                >
                  <span className="min-w-0">
                    <span className="text-navy dark:text-ivory block truncate text-sm font-black">
                      {ticket.subject}
                    </span>
                    <span className="text-navy/45 dark:text-wheat mt-0.5 block text-[10px] font-bold">
                      {ticket.createdAt}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1 text-[10px] font-black",
                      status.cls,
                    )}
                  >
                    {status.label}
                  </span>
                </button>
                {open ? <TicketThread ticket={ticket} /> : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function TicketThread({ ticket }: { ticket: Ticket }) {
  const [reply, setReply] = useState("");

  function send() {
    const text = reply.trim();
    if (text.length < 2) return;
    replyTicket(ticket.id, "user", text);
    setReply("");
  }

  return (
    <div className="border-navy/8 bg-navy/2 dark:border-gold/15 space-y-3 border-t px-4 py-4 dark:bg-white/2">
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
            <p className="text-navy/40 dark:text-wheat mt-1.5 text-[10px] font-bold">
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
          className="border-navy/12 text-navy dark:border-gold/25 dark:bg-navy-mid dark:text-ivory h-10 flex-1 rounded-xl border bg-white px-4 text-sm outline-none"
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
