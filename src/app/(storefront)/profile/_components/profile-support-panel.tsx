"use client";

import { useState } from "react";
import { Headphones, Plus } from "lucide-react";
import { toast } from "@/lib/toast";
import { useStore } from "@/providers/store-provider";
import type { Ticket, TicketStatus } from "@/lib/shop/tickets";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePolling } from "@/hooks/use-polling";
import { createTicketAction, getMyTicketsAction } from "../_lib/actions";
import { PROFILE_CARD } from "./profile-shared";
import { TicketThread } from "./ticket-thread";

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
    cls: "bg-navy/8 text-navy/70 dark:bg-white/10 dark:text-ivory/55",
  },
};

const POLL_MS = 8_000;

const FIELD_LABEL = "text-navy/70 dark:text-wheat text-xs font-black";

function fieldClass(error?: string) {
  return cn(
    "w-full rounded-2xl border bg-transparent px-4 text-sm outline-none transition-[color,box-shadow,border-color] duration-200",
    "text-navy",
    "dark:text-ivory",
    error
      ? "border-rose"
      : "border-navy/12 focus:border-gold focus:shadow-[0_18px_50px_-14px_rgba(193,147,87,0.48),0_0_0_4px_rgba(193,147,87,0.16)] dark:border-gold/25 dark:focus:shadow-[0_18px_50px_-14px_rgba(232,197,122,0.32),0_0_0_4px_rgba(232,197,122,0.16)]",
  );
}

// 🎫 Support panel keeps ticket logic out of the first profile paint.
export function ProfileSupportPanel() {
  const { user } = useStore();
  const [tickets, setTickets] = usePolling<Ticket[]>(
    getMyTicketsAction,
    POLL_MS,
    [],
    Boolean(user),
  );
  const [compose, setCompose] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ subject?: string; message?: string }>(
    {},
  );

  function refresh() {
    getMyTicketsAction().then(setTickets);
  }

  if (!user) return null;

  async function submit() {
    const next: { subject?: string; message?: string } = {};
    if (subject.trim().length < 3)
      next.subject = "موضوع باید حداقل ۳ حرف باشد.";
    if (message.trim().length < 10)
      next.message = "پیام باید حداقل ۱۰ حرف باشد.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const result = await createTicketAction({
      subject: subject.trim(),
      message: message.trim(),
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    setTickets((current) => [result.data, ...current]);
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
          <p className="text-navy/70 dark:text-wheat mt-1 text-xs leading-6">
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
            <span className={FIELD_LABEL}>موضوع</span>
            <input
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                setErrors((current) => ({ ...current, subject: undefined }));
              }}
              maxLength={60}
              placeholder="سایز، سفارش…"
              aria-invalid={Boolean(errors.subject)}
              aria-describedby={errors.subject ? "ticket-subject-error" : undefined}
              className={cn(fieldClass(errors.subject), "h-11")}
            />
            {errors.subject ? (
              <p id="ticket-subject-error" role="alert" className="text-rose text-xs font-bold">
                {errors.subject}
              </p>
            ) : null}
          </label>

          <label className="block space-y-1.5">
            <span className={FIELD_LABEL}>پیام</span>
            <textarea
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setErrors((current) => ({ ...current, message: undefined }));
              }}
              maxLength={600}
              placeholder="سوال‌تان را بنویسید…"
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "ticket-message-error" : undefined}
              className={cn(fieldClass(errors.message), "min-h-32 py-3")}
            />
            {errors.message ? (
              <p id="ticket-message-error" role="alert" className="text-rose text-xs font-bold">
                {errors.message}
              </p>
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
        <div
          className={cn(
            "mt-6 rounded-2xl border border-dashed px-6 py-10 text-center",
            "border-navy/15",
            "dark:border-gold/25",
          )}
        >
          <Headphones className="text-gold mx-auto size-9" />
          <p className="text-navy dark:text-ivory mt-3 font-black">
            هنوز تیکتی ندارید
          </p>
          <p
            className={cn(
              "mx-auto mt-1 max-w-xs text-xs leading-6",
              "text-navy/70",
              "dark:text-wheat",
            )}
          >
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
                className={cn(
                  "overflow-hidden rounded-2xl border",
                  "border-navy/10",
                  "dark:border-gold/25",
                )}
              >
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-start transition-colors",
                    "hover:bg-navy/3",
                    "dark:hover:bg-white/4",
                  )}
                  onClick={() => setOpenId(open ? null : ticket.id)}
                  aria-expanded={open}
                >
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block truncate text-sm font-black",
                        "text-navy",
                        "dark:text-ivory",
                      )}
                    >
                      {ticket.subject}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block text-[10px] font-bold",
                        "text-navy/70",
                        "dark:text-wheat",
                      )}
                    >
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
                {open ? (
                  <TicketThread ticket={ticket} onSent={refresh} />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
