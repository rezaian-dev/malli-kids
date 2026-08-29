import {
  CheckCheck,
  CircleAlert,
  Clock3,
  Hourglass,
  LockKeyhole,
  LockKeyholeOpen,
  Mail,
  Reply,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toFaDigits } from "@/lib/locale/fa";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import type { CannedResponse } from "@/lib/shop/canned-responses";
import type {
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/lib/shop/tickets";
import {
  TICKET_CATEGORY_LABEL,
  TICKET_PRIORITY_LABEL,
  TICKET_STATUS_META,
} from "@/lib/support/ticket-labels";

const TICKET_ACTION_BUTTON =
  "min-h-9 flex-1 rounded-xl text-[10px] sm:flex-none";

const STATUS_STYLE: Record<TicketStatus, { cls: string; dot: string }> = {
  open: {
    cls: "bg-rose/10 text-rose dark:bg-rose/15",
    dot: "bg-rose",
  },
  pending: {
    cls: "bg-amber-500/10 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  answered: {
    cls: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/12 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  closed: {
    cls: "bg-navy/7 text-navy/70 dark:bg-white/7 dark:text-ivory/70",
    dot: "bg-navy/35 dark:bg-white/35",
  },
};

const PRIORITY_STYLE: Record<TicketPriority, string> = {
  normal: "bg-navy/6 text-navy/70 dark:bg-white/6 dark:text-ivory/70",
  high: "bg-amber-500/10 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  urgent: "bg-rose/10 text-rose dark:bg-rose/15",
};

function StatusIcon({ status }: { status: TicketStatus }) {
  if (status === "open") return <CircleAlert className="size-3" />;
  if (status === "pending") return <Hourglass className="size-3" />;
  if (status === "answered") return <CheckCheck className="size-3" />;
  return <LockKeyhole className="size-3" />;
}

/** 🎫 One support ticket — thread, triage (category / priority / assignee),
 *  status flow, and (when open) the reply composer with canned inserts. */
export function TicketCard({
  ticket,
  replying,
  replyValue,
  onReplyChange,
  onToggleReply,
  onSend,
  onToggleStatus,
  onTogglePending,
  staff,
  canned,
  onMeta,
}: {
  ticket: Ticket;
  replying: boolean;
  replyValue: string;
  onReplyChange: (value: string) => void;
  onToggleReply: () => void;
  onSend: () => void;
  onToggleStatus: () => void;
  onTogglePending: () => void;
  staff: { id: string; name: string }[];
  canned: CannedResponse[];
  onMeta: (patch: {
    category?: TicketCategory;
    priority?: TicketPriority;
    assigneeId?: string | null;
  }) => void;
}) {
  const style = STATUS_STYLE[ticket.status];
  const lastReply = ticket.replies.at(-1);

  return (
    <article
      className={cn(
        adminGlassCard,
        ticket.status === "open" && "border-rose/20 dark:border-rose/25",
        ticket.priority === "urgent" &&
          ticket.status !== "closed" &&
          "border-s-rose border-s-4",
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
                  style.dot,
                )}
              />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-navy dark:text-ivory font-black">
                  {ticket.name}
                </p>
                <span className="text-navy/50 dark:text-wheat/60 bg-navy/5 rounded-lg px-2 py-1 text-[9px] font-black dark:bg-white/6">
                  {toFaDigits(
                    ticket.number
                      ? `#${ticket.number}`
                      : `#${ticket.id.slice(-6)}`,
                  )}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-black",
                    style.cls,
                  )}
                >
                  <StatusIcon status={ticket.status} />
                  {TICKET_STATUS_META[ticket.status].admin}
                </span>
                <span className="text-gold-deep dark:text-gold-soft bg-gold/10 rounded-lg px-2 py-1 text-[9px] font-black">
                  {TICKET_CATEGORY_LABEL[ticket.category]}
                </span>
                <span
                  className={cn(
                    "rounded-lg px-2 py-1 text-[9px] font-black",
                    PRIORITY_STYLE[ticket.priority],
                  )}
                >
                  {TICKET_PRIORITY_LABEL[ticket.priority]}
                </span>
                {ticket.status === "open" && ticket.waitingHours !== null ? (
                  <span className="text-navy/70 dark:text-wheat inline-flex items-center gap-1 rounded-lg px-1 py-1 text-[9px] font-bold">
                    <Clock3 className="size-3" />
                    {ticket.waitingHours === 0
                      ? "کمتر از یک ساعت در انتظار"
                      : `${toFaDigits(ticket.waitingHours)} ساعت در انتظار`}
                  </span>
                ) : null}
              </div>
              <h2 className="text-navy/78 dark:text-ivory/78 mt-1 text-sm font-black">
                {ticket.subject}
              </h2>
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-between gap-3 sm:block sm:text-end">
            <p className="text-navy/70 dark:text-wheat text-[10px] font-bold">
              {ticket.createdAt}
            </p>
            <p className="text-navy/70 dark:text-wheat/70 mt-1 text-[9px] font-black">
              {toFaDigits(ticket.replies.length)} پیام
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
                      : "text-navy/70 dark:text-wheat"
                  }
                >
                  {item.from === "support" ? "پشتیبانی ملی‌کیدز" : "کاربر"}
                </span>
                <span className="text-navy/70 dark:text-wheat/70 font-bold">
                  {item.at}
                </span>
              </div>
              <p>{item.text}</p>
            </div>
          ))}
        </div>

        {/* 🗂️ Triage row — category / priority / assignee, each one tap. */}
        <div className="border-navy/6 dark:border-gold/12 mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
          <Select
            value={ticket.category}
            onValueChange={(value) =>
              onMeta({ category: value as TicketCategory })
            }
            dir="rtl"
          >
            <SelectTrigger
              aria-label="دسته‌بندی تیکت"
              className="h-8 w-auto gap-1 rounded-lg text-[10px] font-bold"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(TICKET_CATEGORY_LABEL) as TicketCategory[]).map(
                (value) => (
                  <SelectItem key={value} value={value}>
                    {TICKET_CATEGORY_LABEL[value]}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          <Select
            value={ticket.priority}
            onValueChange={(value) =>
              onMeta({ priority: value as TicketPriority })
            }
            dir="rtl"
          >
            <SelectTrigger
              aria-label="اولویت تیکت"
              className="h-8 w-auto gap-1 rounded-lg text-[10px] font-bold"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">عادی</SelectItem>
              <SelectItem value="high">مهم</SelectItem>
              <SelectItem value="urgent">فوری</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={ticket.assigneeId ?? "none"}
            onValueChange={(value) =>
              onMeta({ assigneeId: value === "none" ? null : value })
            }
            dir="rtl"
          >
            <SelectTrigger
              aria-label="ارجاع به کارشناس"
              className="h-8 w-auto max-w-44 gap-1 rounded-lg text-[10px] font-bold"
            >
              <SelectValue placeholder="ارجاع به…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">بدون ارجاع</SelectItem>
              {staff.map((person) => (
                <SelectItem key={person.id} value={person.id}>
                  {person.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {ticket.assigneeName ? (
            <span className="text-navy/70 dark:text-wheat text-[10px] font-bold">
              کارشناس: {ticket.assigneeName}
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-navy/70 dark:text-wheat/70 hidden text-[9px] font-bold sm:block">
            آخرین پیام: {lastReply?.from === "support" ? "پشتیبانی" : "کاربر"}
          </p>
          <div className="ms-auto flex w-full gap-2 sm:w-auto">
            {ticket.status !== "closed" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={TICKET_ACTION_BUTTON}
                onClick={onTogglePending}
              >
                <Hourglass className="size-3.5" />{" "}
                {ticket.status === "pending"
                  ? "بازگردانی به صف"
                  : "در انتظار مشتری"}
              </Button>
            ) : null}
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
            {canned.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  onReplyChange(
                    replyValue ? `${replyValue}\n${item.body}` : item.body,
                  )
                }
                title={item.body}
                className={cn(
                  "shrink-0 rounded-xl border bg-white/70 px-3 py-1.5 text-[10px] font-bold transition",
                  "border-navy/8 text-navy/70 hover:border-gold/40",
                  "dark:border-gold/14 dark:bg-navy-deep/35 dark:text-wheat",
                )}
              >
                {item.title}
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
