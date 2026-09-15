"use client";

import { requestErrorMessage } from "@/lib/action-result";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Headphones,
  Minus,
  RotateCcw,
  Send,
  Star,
  TicketPlus,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toFaDigits } from "@/lib/locale/fa";
import { toast } from "@/lib/toast";
import { usePolling } from "@/hooks/use-polling";
import { isWithinSupportHours } from "@/lib/support/hours";
import {
  escalateChatToTicketAction,
  getMyChatAction,
  getSupportHoursAction,
  markChatReadAction,
  pingChatTypingAction,
  sendChatMessageAction,
  submitChatRatingAction,
  type ChatThread,
} from "@/lib/shop/chat-actions";
import type { SupportHours } from "@/lib/shop/settings";

// Mirrors CHAT_MESSAGE_MAX_LEN in lib/shop/chat.ts (server-only module)
const MESSAGE_MAX_LEN = 1000;
const POLL_MS = 4_000;
// One heartbeat per 3s — inside the 6s server window
const TYPING_PING_MS = 3_000;

type Status = "live" | "retrying" | "offline";

// Display only messages confirmed by the server.
export function ChatWindow({ onClose }: { onClose: () => void }) {
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [pollError, setPollError] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [hours, setHours] = useState<SupportHours | null>(null);
  const [stars, setStars] = useState(0);
  const starRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // APG radiogroup keyboard support. Layout is RTL (star 1 at the right):
  // ArrowLeft moves toward higher values, ArrowRight toward lower.
  function onStarsKeyDown(event: { key: string; preventDefault: () => void }) {
    let next: number | null = null;
    if (event.key === "ArrowLeft") next = Math.min(5, stars + 1);
    else if (event.key === "ArrowRight") next = Math.max(1, stars - 1);
    else if (event.key === "Home") next = 1;
    else if (event.key === "End") next = 5;
    else return;
    event.preventDefault();
    setStars(next);
    starRefs.current[next - 1]?.focus();
  }
  const [ratingNote, setRatingNote] = useState("");
  const [ratingSending, setRatingSending] = useState(false);
  const [escalating, setEscalating] = useState(false);
  // Retries reuse the id — a lost response can't duplicate server-side
  const pendingClientId = useRef<string | null>(null);
  const prevRef = useRef<ChatThread | null>(null);
  const lastAdminId = useRef<string | null>(null);
  const lastPingAt = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLInputElement>(null);

  // Online/offline gates polling; refetches instantly on reconnect
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  // Support hours load once per open
  useEffect(() => {
    getSupportHoursAction()
      .then(setHours)
      .catch(() => {});
  }, []);

  // usePolling doesn't catch — this wrapper must never reject
  const [data, setData] = usePolling<ChatThread | null>(
    async () => {
      try {
        const next = await getMyChatAction();
        prevRef.current = next;
        setPollError(false);
        return next;
      } catch {
        setPollError(true);
        return prevRef.current;
      }
    },
    POLL_MS,
    null,
    online,
  );

  const conversation = data?.conversation ?? null;
  const messages = useMemo(() => data?.messages ?? [], [data]);
  const loading = data === null && !pollError;
  const status: Status = !online ? "offline" : pollError ? "retrying" : "live";
  const openHours =
    !hours || isWithinSupportHours(new Date(), hours.startHour, hours.endHour);

  // Thread is visible — clear unread as admin messages arrive
  useEffect(() => {
    if (!conversation || conversation.customerUnreadCount === 0) return;
    const last = messages[messages.length - 1];
    if (!last || last.senderRole !== "admin") return;
    void markChatReadAction(conversation.id);
    setData((current) =>
      current?.conversation
        ? {
            ...current,
            conversation: { ...current.conversation, customerUnreadCount: 0 },
          }
        : current,
    );
  }, [conversation, messages, setData]);

  // Announce new admin replies to screen readers
  useEffect(() => {
    const admins = messages.filter((m) => m.senderRole === "admin");
    const lastId = admins.length ? admins[admins.length - 1].id : null;
    if (lastId && lastId !== lastAdminId.current) {
      if (lastAdminId.current !== null) {
        setAnnouncement("پیام جدید از پشتیبانی رسید.");
      }
      lastAdminId.current = lastId;
    }
  }, [messages]);

  // Pin to bottom; length-keyed so idle polls don't yank scroll
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, conversation?.adminTyping]);

  // Focus only with a fine pointer — no uninvited mobile keyboard
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) {
      composerRef.current?.focus();
    }
  }, []);

  // ⎋ Window-level Escape — works even when focus left the dialog
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function onDraftChange(value: string) {
    setDraft(value);
    // Throttled heartbeat — keeps the admin "writing…" state fresh
    if (!conversation || !value.trim() || !online) return;
    const now = Date.now();
    if (now - lastPingAt.current < TYPING_PING_MS) return;
    lastPingAt.current = now;
    void pingChatTypingAction(conversation.id).catch(() => {});
  }

  async function send() {
    const text = draft.trim();
    if (!text || sending || !online) return;
    if (text.length > MESSAGE_MAX_LEN) {
      setSendError(`پیام نباید بیشتر از ${MESSAGE_MAX_LEN} حرف باشد.`);
      return;
    }
    setSending(true);
    setSendError(null);
    if (!pendingClientId.current) {
      pendingClientId.current = crypto.randomUUID();
    }
    try {
      const result = await sendChatMessageAction({
        body: text,
        clientId: pendingClientId.current,
        page: window.location.pathname,
      });
      if (!result.ok) {
        setSendError(result.error);
        return;
      }
      pendingClientId.current = null;
      setDraft("");
      setData(result.data);
    } catch {
      setSendError(requestErrorMessage());
    } finally {
      setSending(false);
    }
  }

  async function submitRating() {
    if (!conversation || stars < 1 || ratingSending) return;
    setRatingSending(true);
    try {
      const result = await submitChatRatingAction(
        conversation.id,
        stars,
        ratingNote.trim() || undefined,
      );
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("ممنون از امتیاز شما ⭐");
      // Optimistic local echo; the next poll confirms
      setData((current) =>
        current?.conversation
          ? {
              ...current,
              conversation: { ...current.conversation, rating: stars },
            }
          : current,
      );
    } catch {
      toast.error("ثبت امتیاز ناموفق بود؛ دوباره تلاش کنید.");
    } finally {
      setRatingSending(false);
    }
  }

  async function escalate() {
    if (!conversation || escalating) return;
    setEscalating(true);
    try {
      const result = await escalateChatToTicketAction(conversation.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        result.data?.number
          ? `گفتگو به تیکت ${toFaDigits(`#${result.data.number}`)} تبدیل شد — پیگیری از پنل کاربری`
          : "گفتگو به تیکت تبدیل شد — پیگیری از پنل کاربری",
      );
      const next = await getMyChatAction().catch(() => null);
      if (next) {
        prevRef.current = next;
        setData(next);
      }
    } catch {
      toast.error("تبدیل به تیکت ناموفق بود؛ دوباره تلاش کنید.");
    } finally {
      setEscalating(false);
    }
  }

  function retryPoll() {
    getMyChatAction()
      .then((next) => {
        prevRef.current = next;
        setPollError(false);
        setData(next);
      })
      .catch(() => setPollError(true));
  }

  const showRating = conversation?.status === "closed" && !conversation.rating;

  return (
    <div
      id="support-chat-window"
      role="dialog"
      aria-label="گفتگو با پشتیبانی"
      className="fixed z-75 flex overflow-hidden rounded-3xl border shadow-2xl max-sm:inset-x-3 max-sm:bottom-3 max-sm:h-[calc(100dvh-5.5rem)] sm:inset-s-6 sm:bottom-24 sm:h-[min(36rem,calc(100dvh-8rem))] sm:w-96 border-gold/40 bg-paper text-navy dark:border-gold/50 dark:bg-dusk dark:text-ivory motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-300"
    >
      <div className="flex min-h-0 w-full flex-col">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 px-4 py-3 from-navy to-navy-mid border-gold/30 border-b bg-linear-to-br dark:border-gold/40">
          <span
            aria-hidden
            className={cn(
              "size-2.5 shrink-0 rounded-full",
              status === "live" && "bg-emerald-400",
              status === "retrying" && "bg-amber-400",
              status === "offline" && "bg-rose-400",
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="m-0 text-sm font-black text-white">پشتیبانی MALLI KIDS</p>
            <p className="text-gold-soft m-0 text-[10px] font-bold">
              {status === "live"
                ? "متصل — معمولاً در چند دقیقه پاسخ می‌دهیم"
                : status === "retrying"
                  ? "پاسخی از پشتیبانی دریافت نشد؛ تلاش مجدد…"
                  : "اتصال اینترنت قطع است"}
            </p>
          </div>
          {conversation && !conversation.escalatedTicketNumber ? (
            <button
              type="button"
              onClick={escalate}
              disabled={escalating}
              aria-label="ثبت گفتگو به‌صورت تیکت"
              title="ثبت گفتگو به‌صورت تیکت"
              className="grid size-9 shrink-0 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <TicketPlus className="size-5" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن گفتگو"
            className="grid size-9 shrink-0 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Minus className="size-5" />
          </button>
        </div>

        {/* Offline notice */}
        {status === "offline" ? (
          <p
            role="alert"
            className="bg-rose/10 text-rose flex shrink-0 items-center justify-center gap-2 px-4 py-2 text-[11px] font-black"
          >
            <WifiOff className="size-4" /> اینترنت قطع است — پیام‌ها ذخیره نمی‌شوند
          </p>
        ) : null}

        {/* Closed notice */}
        {conversation?.status === "closed" ? (
          <p className="bg-gold/10 text-navy dark:text-gold-soft shrink-0 px-4 py-2 text-center text-[11px] font-bold">
            این گفتگو بسته شده — پیام جدید، گفتگوی تازه‌ای باز می‌کند.
          </p>
        ) : null}

        {/* Outside-hours notice */}
        {conversation?.status !== "closed" && !openHours && hours ? (
          <p className="bg-gold/10 text-navy dark:text-gold-soft shrink-0 px-4 py-2 text-center text-[11px] font-bold">
            خارج از ساعات پاسخگویی ({hours.label}) — پیام شما ثبت می‌شود و در ساعات کاری
            پاسخ می‌دهیم.
          </p>
        ) : null}

        {/* Escalated notice */}
        {conversation?.escalatedTicketNumber ? (
          <p className="bg-gold/10 text-navy dark:text-gold-soft shrink-0 px-4 py-2 text-center text-[11px] font-bold">
            این گفتگو به تیکت {toFaDigits(`#${conversation.escalatedTicketNumber}`)} تبدیل
            شده — پیگیری از پنل کاربری.
          </p>
        ) : null}

        {/* Messages */}
        <div
          ref={listRef}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
          aria-label="پیام‌های گفتگو"
        >
          {loading ? (
            <div className="space-y-3" aria-hidden>
              <Skeleton className="h-14 w-3/4 rounded-2xl" />
              <Skeleton className="ms-auto h-14 w-2/3 rounded-2xl" />
              <Skeleton className="h-14 w-1/2 rounded-2xl" />
            </div>
          ) : pollError && messages.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-black">خطا در دریافت گفتگو</p>
              <p className="text-navy/70 dark:text-wheat mt-1 text-xs">
                {requestErrorMessage()}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={retryPoll}
                className="mt-3 rounded-full"
              >
                <RotateCcw className="size-4" /> تلاش مجدد
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-10 text-center">
              <Headphones className="text-gold mx-auto size-10" />
              <p className="mt-3 text-sm font-black">سلام! 👋 سوالتان را بنویسید</p>
              <p className="text-navy/70 dark:text-wheat mx-auto mt-1 max-w-55 text-xs leading-6">
                مشاوره سایز، پیگیری سفارش یا هر سوال دیگر — همین‌جا پاسخ می‌گیرید.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const mine = message.senderRole === "customer";
              return (
                <div
                  key={message.id}
                  className={cn("flex", mine ? "justify-start" : "justify-end")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7",
                      mine
                        ? "border-navy/10 text-navy dark:bg-dusk-mid dark:text-linen rounded-ss-md border bg-white dark:border-white/10"
                        : "border-gold/30 bg-gold/10 text-navy dark:text-ivory rounded-se-md border",
                    )}
                  >
                    <p className="text-gold mb-1 text-[10px] font-black">
                      {mine ? "شما" : "پشتیبانی"}
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
          {sending ? (
            <p className="text-navy/60 dark:text-wheat/70 text-start text-[11px] font-bold">
              در حال ارسال…
            </p>
          ) : null}
          {/* Admin typing indicator */}
          {conversation?.adminTyping ? (
            <div className="flex justify-end" aria-live="polite">
              <p className="border-gold/30 bg-gold/10 text-navy dark:text-ivory flex items-center gap-1.5 rounded-2xl rounded-se-md border px-4 py-3 text-[11px] font-bold">
                پشتیبانی در حال نوشتن
                <span aria-hidden className="flex gap-0.5">
                  <span className="bg-gold size-1.5 animate-bounce rounded-full [animation-delay:0ms]" />
                  <span className="bg-gold size-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
                  <span className="bg-gold size-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
                </span>
              </p>
            </div>
          ) : null}
        </div>

        {/* Post-close rating */}
        {showRating ? (
          <div className="border-navy/8 dark:border-gold/15 shrink-0 space-y-2 border-t px-4 py-3">
            <p className="text-center text-xs font-black">از این گفتگو راضی بودید؟</p>
            <div
              role="radiogroup"
              aria-label="امتیاز به گفتگو"
              className="flex items-center justify-center gap-1"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={stars === value}
                  aria-label={`${toFaDigits(value)} از ۵`}
                  ref={(node) => {
                    starRefs.current[value - 1] = node;
                  }}
                  tabIndex={
                    stars === 0
                      ? value === 1
                        ? 0
                        : -1
                      : stars === value
                        ? 0
                        : -1
                  }
                  onClick={() => setStars(value)}
                  onKeyDown={onStarsKeyDown}
                  className="grid size-9 place-items-center rounded-full transition-transform motion-safe:hover:scale-110"
                >
                  <Star
                    className={cn(
                      "size-6",
                      value <= stars
                        ? "fill-gold text-gold"
                        : "text-navy/25 dark:text-white/25",
                    )}
                  />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={ratingNote}
                onChange={(event) => setRatingNote(event.target.value)}
                maxLength={500}
                placeholder="نظر (اختیاری)…"
                aria-label="نظر درباره گفتگو"
                className="h-9 min-w-0 flex-1 rounded-full border bg-white px-4 text-xs outline-none border-navy/12 text-navy focus:border-gold dark:border-gold/25 dark:bg-navy-mid dark:text-ivory"
              />
              <Button
                type="button"
                variant="navy"
                size="sm"
                onClick={submitRating}
                disabled={stars < 1 || ratingSending}
                className="h-9 shrink-0 rounded-full px-4"
              >
                {ratingSending ? "در حال ثبت…" : "ثبت امتیاز"}
              </Button>
            </div>
          </div>
        ) : null}

        {/* Send failure */}
        {sendError ? (
          <div
            role="alert"
            className="border-rose/25 bg-rose/8 mx-3 mb-2 flex shrink-0 items-center justify-between gap-2 rounded-2xl border px-3 py-2"
          >
            <p className="text-rose m-0 text-[11px] font-bold">{sendError}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={send}
              disabled={sending || !online}
              className="text-rose hover:bg-rose/10 hover:text-rose h-8 shrink-0 rounded-full px-3 text-[11px] font-black"
            >
              <RotateCcw className="size-3.5" /> تلاش مجدد
            </Button>
          </div>
        ) : null}

        {/* Composer */}
        <div className="border-navy/8 dark:border-gold/15 shrink-0 border-t p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex gap-2">
            <input
              ref={composerRef}
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                send();
              }}
              onFocus={(event) => {
                // iOS Safari doesn't resize the layout for the keyboard
                event.target.scrollIntoView({ block: "nearest" });
              }}
              disabled={sending || !online}
              maxLength={MESSAGE_MAX_LEN}
              placeholder="پیام خود را بنویسید…"
              aria-label="پیام خود را بنویسید"
              className="h-11 min-w-0 flex-1 rounded-full border bg-white px-4 text-sm outline-none disabled:opacity-60 border-navy/12 text-navy focus:border-gold dark:border-gold/25 dark:bg-navy-mid dark:text-ivory"
            />
            <Button
              type="button"
              variant="navy"
              size="icon"
              onClick={send}
              disabled={sending || !online}
              aria-label="ارسال پیام"
              aria-busy={sending || undefined}
              className="size-11 shrink-0 rounded-full"
            >
              <Send className="size-4 -scale-x-100" />
            </Button>
          </div>
        </div>

        <span aria-live="polite" className="sr-only">
          {announcement}
        </span>
      </div>
    </div>
  );
}
