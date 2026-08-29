"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  ArrowRight,
  CheckCheck,
  CircleAlert,
  Headphones,
  LockKeyhole,
  MessagesSquare,
  RotateCcw,
  Send,
  Star,
  TicketCheck,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { usePolling } from "@/hooks/use-polling";
import type { ChatConversation, ChatStatus } from "@/lib/shop/chat";
import {
  getChatThreadAction,
  markChatReadAsAdminAction,
  pingChatTypingAsAdminAction,
  sendChatReplyAction,
  setChatStatusAction,
  type ChatThread,
} from "@/lib/shop/chat-actions";
import { setChatAssigneeAction } from "../_lib/actions";
import type { CannedResponse } from "@/lib/shop/canned-responses";
import { toFaDigits } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminStatStrip,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const THREAD_POLL_MS = 4_000;
const REPLY_MAX_LEN = 1000;
const TYPING_PING_MS = 3_000;

const CHAT_STATUS: Record<ChatStatus, { label: string; cls: string }> = {
  open: {
    label: "نیازمند پاسخ",
    cls: "bg-rose/10 text-rose dark:bg-rose-400/15 dark:text-rose-200",
  },
  active: {
    label: "فعال",
    cls: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  },
  closed: {
    label: "بسته شده",
    cls: "bg-navy/8 text-navy/70 dark:bg-white/10 dark:text-ivory/70",
  },
};

type StatusFilter = "all" | ChatStatus;

/** 💬 The live-chat half of the support center — inbox list plus the open
 *  thread, reusing the same polling/chrome/filter vocabulary as tickets.
 *  The list itself is polled once in the parent landing (which also needs
 *  it for the tab badge), so this panel just renders + optimistically
 *  updates the list it's handed. */
export function AdminChatPanel({
  conversations,
  setConversations,
  onConversationChanged,
  staff,
  canned,
}: {
  conversations: ChatConversation[];
  setConversations: Dispatch<SetStateAction<ChatConversation[]>>;
  onConversationChanged: (conversation: ChatConversation) => void;
  staff: { id: string; name: string }[];
  canned: CannedResponse[];
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    return conversations.filter((conv) => {
      const haystack =
        `${conv.customerName} ${conv.lastMessagePreview}`.toLocaleLowerCase(
          "fa",
        );
      return (
        (!term || haystack.includes(term)) &&
        (status === "all" || conv.status === status)
      );
    });
  }, [q, status, conversations]);

  const open = conversations.filter((c) => c.status === "open").length;
  const active = conversations.filter((c) => c.status === "active").length;
  const closed = conversations.filter((c) => c.status === "closed").length;
  const unread = conversations.filter((c) => c.adminUnreadCount > 0).length;
  const activeFilters = Number(!!q.trim()) + Number(status !== "all");
  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  return (
    <div>
      <AdminStatStrip
        items={[
          {
            label: "کل گفتگوها",
            value: conversations.length,
            Icon: MessagesSquare,
            tone: "blue",
          },
          {
            label: "نیازمند پاسخ",
            value: open,
            hint: open ? "در انتظار تیم پشتیبانی" : "صفی خالی است",
            Icon: CircleAlert,
            tone: "rose",
          },
          { label: "فعال", value: active, Icon: CheckCheck, tone: "emerald" },
          { label: "بسته‌شده", value: closed, Icon: LockKeyhole, tone: "gold" },
        ]}
      />

      <AdminFilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="نام مشتری یا متن پیام…"
        resultCount={list.length}
        resultLabel="گفتگو"
        activeCount={activeFilters}
        onReset={() => {
          setQ("");
          setStatus("all");
        }}
      >
        <AdminFilterSelect
          label="وضعیت"
          value={status}
          onValueChange={(value) => setStatus(value as StatusFilter)}
          options={[
            { value: "all", label: "همه گفتگوها", count: conversations.length },
            { value: "open", label: "نیازمند پاسخ", count: open },
            { value: "active", label: "فعال", count: active },
            { value: "closed", label: "بسته‌شده", count: closed },
          ]}
        />
      </AdminFilterBar>

      {conversations.length === 0 ? (
        <div className={cn(adminGlassCard, "px-5 py-14 text-center")}>
          <span className="bg-gold/12 text-gold mx-auto grid size-14 place-items-center rounded-2xl">
            <Headphones className="size-6" />
          </span>
          <p className="text-navy dark:text-ivory mt-4 font-black">
            هنوز گفتگوی زنده‌ای شروع نشده
          </p>
          <p className="text-navy/70 dark:text-wheat mx-auto mt-1 max-w-sm text-xs leading-6">
            وقتی مشتری از حباب پشتیبانی فروشگاه پیام بدهد، گفتگو همین‌جا — بدون
            نیاز به رفرش — ظاهر می‌شود.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-[21rem_1fr]">
          {/* Inbox list — hidden on mobile while a thread is open. */}
          <div className={cn(selectedId && "max-lg:hidden")}>
            <ul className="max-lg:grid max-lg:gap-3 lg:max-h-175 lg:space-y-2 lg:overflow-y-auto lg:ps-1 lg:pb-2">
              {list.map((conv) => {
                const chip = CHAT_STATUS[conv.status];
                const isSelected = conv.id === selectedId;
                return (
                  <li key={conv.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(conv.id)}
                      aria-current={isSelected || undefined}
                      className={cn(
                        "w-full rounded-2xl border p-3 text-start transition-colors",
                        "border-navy/10 hover:border-gold/50 bg-white/70",
                        "dark:border-gold/25 dark:hover:border-gold/50 dark:bg-white/4",
                        isSelected &&
                          "border-gold/60 dark:border-gold/60 shadow-[0_0_0_3px_rgba(193,147,87,0.18)]",
                        conv.adminUnreadCount > 0 &&
                          !isSelected &&
                          "border-gold/40",
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-navy dark:text-ivory min-w-0 truncate text-sm font-black">
                          {conv.customerName}
                        </span>
                        {conv.adminUnreadCount > 0 ? (
                          <span className="bg-rose grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-black text-white">
                            {toFaDigits(conv.adminUnreadCount)}
                          </span>
                        ) : null}
                      </span>
                      <span className="text-navy/70 dark:text-wheat mt-1 block truncate text-xs">
                        {conv.lastMessagePreview || "—"}
                      </span>
                      <span className="mt-2 flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[10px] font-black",
                            chip.cls,
                          )}
                        >
                          {chip.label}
                        </span>
                        <span className="text-navy/60 dark:text-wheat/70 text-[10px] font-bold">
                          {conv.lastMessageAt}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {list.length === 0 ? (
              <p className="text-navy/70 dark:text-wheat border-navy/15 dark:border-gold/25 rounded-2xl border border-dashed px-4 py-8 text-center text-xs">
                گفتگویی مطابق فیلترها پیدا نشد.
              </p>
            ) : null}
          </div>

          {/* Open thread — takes over on mobile with a back button. */}
          <div className={cn(!selectedId && "max-lg:hidden")}>
            {selected ? (
              <AdminChatThread
                key={selected.id}
                conversationId={selected.id}
                onBack={() => setSelectedId(null)}
                onConversationChanged={onConversationChanged}
                staff={staff}
                canned={canned}
                onMarkedRead={(id) =>
                  setConversations((current) =>
                    current.map((conv) =>
                      conv.id === id ? { ...conv, adminUnreadCount: 0 } : conv,
                    ),
                  )
                }
              />
            ) : (
              <div
                className={cn(
                  adminGlassCard,
                  "hidden px-5 py-16 text-center lg:block",
                )}
              >
                <MessagesSquare className="text-gold/60 mx-auto size-9" />
                <p className="text-navy dark:text-ivory mt-3 text-sm font-black">
                  یک گفتگو انتخاب کنید
                </p>
                <p className="text-navy/70 dark:text-wheat mt-1 text-xs">
                  {unread
                    ? `${toFaDigits(unread)} گفتگو پیام خوانده‌نشده دارد.`
                    : "پیام‌های مشتری و پاسخ‌های شما همین‌جا زنده نمایش داده می‌شوند."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminChatThread({
  conversationId,
  onBack,
  onMarkedRead,
  onConversationChanged,
  staff,
  canned,
}: {
  conversationId: string;
  onBack: () => void;
  onMarkedRead: (conversationId: string) => void;
  onConversationChanged: (conversation: ChatConversation) => void;
  staff: { id: string; name: string }[];
  canned: CannedResponse[];
}) {
  const prevRef = useRef<ChatThread | null>(null);
  const lastPingAt = useRef(0);
  const [pollError, setPollError] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const pendingClientId = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [data, setData] = usePolling<ChatThread | null>(
    async () => {
      try {
        const next = await getChatThreadAction(conversationId);
        const resolved = next ?? prevRef.current;
        prevRef.current = resolved;
        setPollError(false);
        return resolved;
      } catch {
        setPollError(true);
        return prevRef.current;
      }
    },
    THREAD_POLL_MS,
    null,
  );

  const conversation = data?.conversation ?? null;
  const messages = useMemo(() => data?.messages ?? [], [data]);

  // 👀 An open thread counts as read — clear the admin unread the moment
  // customer messages are on screen.
  useEffect(() => {
    if (!conversation || conversation.adminUnreadCount === 0) return;
    const last = messages[messages.length - 1];
    if (!last || last.senderRole !== "customer") return;
    void markChatReadAsAdminAction(conversation.id);
    onMarkedRead(conversation.id);
    setData((current) =>
      current?.conversation
        ? {
            ...current,
            conversation: {
              ...current.conversation,
              adminUnreadCount: 0,
            },
          }
        : current,
    );
  }, [conversation, messages, setData, onMarkedRead]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, conversation?.customerTyping]);

  function onDraftChange(value: string) {
    setDraft(value);
    if (!value.trim()) return;
    const now = Date.now();
    if (now - lastPingAt.current < TYPING_PING_MS) return;
    lastPingAt.current = now;
    void pingChatTypingAsAdminAction(conversationId);
  }

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;
    if (text.length > REPLY_MAX_LEN) {
      toast.warning(`پاسخ نباید بیشتر از ${REPLY_MAX_LEN} حرف باشد.`);
      return;
    }
    setSending(true);
    if (!pendingClientId.current) {
      pendingClientId.current = crypto.randomUUID();
    }
    try {
      const result = await sendChatReplyAction({
        conversationId,
        body: text,
        clientId: pendingClientId.current,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      pendingClientId.current = null;
      setDraft("");
      setData(result.data);
      if (result.data.conversation)
        onConversationChanged(result.data.conversation);
      toast.success("پاسخ ارسال شد");
    } catch {
      toast.error("ارسال نشد؛ اتصال را بررسی کنید و دوباره تلاش کنید.");
    } finally {
      setSending(false);
    }
  }

  function changeStatus(next: ChatStatus) {
    void (async () => {
      const result = await setChatStatusAction(conversationId, next);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        next === "closed" ? "گفتگو بسته شد" : "گفتگو دوباره باز شد",
      );
      const thread = await getChatThreadAction(conversationId).catch(
        () => null,
      );
      if (thread) {
        prevRef.current = thread;
        setData(thread);
        if (thread.conversation) onConversationChanged(thread.conversation);
      }
    })();
  }

  function changeAssignee(adminId: string | null) {
    void (async () => {
      const result = await setChatAssigneeAction(conversationId, adminId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(adminId ? "گفتگو ارجاع شد" : "ارجاع گفتگو حذف شد");
      const thread = await getChatThreadAction(conversationId).catch(
        () => null,
      );
      if (thread) {
        prevRef.current = thread;
        setData(thread);
        if (thread.conversation) onConversationChanged(thread.conversation);
      }
    })();
  }

  const chip = conversation ? CHAT_STATUS[conversation.status] : null;
  const assigneeName = staff.find(
    (person) => person.id === conversation?.assignedAdminId,
  )?.name;

  return (
    <section
      aria-label={
        conversation ? `گفتگو با ${conversation.customerName}` : "گفتگو"
      }
      className={cn(
        adminGlassCard,
        "flex min-h-130 flex-col overflow-hidden p-0",
      )}
    >
      {/* Thread header */}
      <div className="border-navy/8 dark:border-gold/15 flex items-center gap-2 border-b px-3 py-2.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="بازگشت به فهرست گفتگوها"
          className="size-9 shrink-0 rounded-xl lg:hidden"
        >
          <ArrowRight className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-navy dark:text-ivory truncate text-sm font-black">
            {conversation?.customerName ?? "…"}
          </p>
          <p className="text-navy/60 dark:text-wheat/70 mt-0.5 truncate text-[10px] font-bold">
            {conversation?.page
              ? `شروع از ${conversation.page}`
              : (conversation?.lastMessageAt ?? "")}
          </p>
        </div>
        {chip ? (
          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-[10px] font-black",
              chip.cls,
            )}
          >
            {chip.label}
          </span>
        ) : null}
        {conversation ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              changeStatus(conversation.status === "closed" ? "open" : "closed")
            }
            className="h-8 shrink-0 rounded-full px-3 text-[11px] font-black"
          >
            {conversation.status === "closed" ? "بازگشایی" : "بستن گفتگو"}
          </Button>
        ) : null}
      </div>

      {/* Meta — assignee, typing, rating, escalation */}
      <div className="border-navy/8 dark:border-gold/15 flex flex-wrap items-center gap-2 border-b px-3 py-2">
        <Select
          value={conversation?.assignedAdminId ?? "none"}
          onValueChange={(value) =>
            changeAssignee(value === "none" ? null : value)
          }
          dir="rtl"
        >
          <SelectTrigger
            aria-label="ارجاع گفتگو به کارشناس"
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
        {assigneeName ? (
          <span className="text-navy/70 dark:text-wheat text-[10px] font-bold">
            کارشناس: {assigneeName}
          </span>
        ) : null}
        {conversation?.customerTyping ? (
          <span className="text-gold-deep dark:text-gold-soft inline-flex animate-pulse items-center gap-1 text-[10px] font-black">
            مشتری در حال نوشتن…
          </span>
        ) : null}
        {conversation?.rating ? (
          <span
            className="bg-gold/10 text-gold-deep dark:text-gold-soft inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black"
            title={conversation.ratedAt ?? undefined}
          >
            <Star className="fill-gold text-gold size-3" />
            {toFaDigits(conversation.rating)} از ۵
          </span>
        ) : null}
        {conversation?.escalatedTicketNumber ? (
          <span className="bg-navy/6 text-navy/70 dark:text-ivory/70 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black dark:bg-white/6">
            <TicketCheck className="size-3" />
            تیکت {toFaDigits(`#${conversation.escalatedTicketNumber}`)}
          </span>
        ) : null}
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        className="min-h-60 flex-1 space-y-3 overflow-y-auto px-4 py-4"
        aria-label="پیام‌های گفتگو"
      >
        {!data && !pollError ? (
          <div className="space-y-3" aria-hidden>
            <Skeleton className="h-14 w-2/3 rounded-2xl" />
            <Skeleton className="ms-auto h-14 w-3/4 rounded-2xl" />
          </div>
        ) : pollError && messages.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-navy dark:text-ivory text-sm font-black">
              خطا در دریافت گفتگو
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                getChatThreadAction(conversationId)
                  .then((thread) => {
                    if (thread) {
                      prevRef.current = thread;
                      setPollError(false);
                      setData(thread);
                    }
                  })
                  .catch(() => setPollError(true));
              }}
              className="mt-3 rounded-full"
            >
              <RotateCcw className="size-4" /> تلاش مجدد
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-navy/70 dark:text-wheat py-10 text-center text-xs">
            هنوز پیامی در این گفتگو ثبت نشده.
          </p>
        ) : (
          messages.map((message) => {
            const fromCustomer = message.senderRole === "customer";
            return (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  fromCustomer ? "justify-start" : "justify-end",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7",
                    fromCustomer
                      ? "border-navy/10 text-navy dark:bg-dusk-mid dark:text-linen rounded-ss-md border bg-white dark:border-white/10"
                      : "border-gold/30 bg-gold/10 text-navy dark:text-ivory rounded-se-md border",
                  )}
                >
                  <p className="text-gold mb-1 text-[10px] font-black">
                    {fromCustomer
                      ? (conversation?.customerName ?? "مشتری")
                      : "شما"}
                  </p>
                  <p className="whitespace-pre-wrap">{message.body}</p>
                  <p className="text-navy/70 dark:text-wheat mt-1.5 text-[10px] font-bold">
                    {message.at}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      <div className="border-navy/8 dark:border-gold/15 border-t p-3">
        {conversation?.status === "closed" ? (
          <p className="text-navy/70 dark:text-wheat mb-2 text-center text-[11px] font-bold">
            این گفتگو بسته است — ارسال پاسخ، آن را دوباره باز می‌کند.
          </p>
        ) : null}
        {canned.length ? (
          <div className="mb-2 flex scrollbar-none gap-1.5 overflow-x-auto pb-1">
            {canned.map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.body}
                onClick={() =>
                  setDraft((current) =>
                    current ? `${current}\n${item.body}` : item.body,
                  )
                }
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
        ) : null}
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              send();
            }}
            disabled={sending}
            maxLength={REPLY_MAX_LEN}
            placeholder="پاسخ خود را بنویسید…"
            aria-label="پاسخ خود را بنویسید"
            className={cn(
              "h-11 min-w-0 flex-1 rounded-xl border bg-white px-4 text-sm outline-none disabled:opacity-60",
              "border-navy/12 text-navy focus:border-gold",
              "dark:border-gold/25 dark:bg-navy-mid dark:text-ivory",
            )}
          />
          <Button
            type="button"
            variant="navy"
            onClick={send}
            disabled={sending}
            aria-label="ارسال پاسخ"
            aria-busy={sending || undefined}
            className="h-11 shrink-0 rounded-xl px-5"
          >
            <Send className="size-4 -scale-x-100" />
            {sending ? "در حال ارسال…" : "ارسال"}
          </Button>
        </div>
      </div>
    </section>
  );
}
