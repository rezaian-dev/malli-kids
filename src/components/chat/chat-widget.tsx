"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { toFaDigits } from "@/lib/locale/fa";
import { usePolling } from "@/hooks/use-polling";
import { getMyChatUnreadAction } from "@/lib/shop/chat-actions";

// The heavy window downloads only on first open — the bubble is the whole always-on cost
const ChatWindow = dynamic(
  () => import("./chat-window").then((m) => m.ChatWindow),
  { ssr: false },
);

const INVITE_DELAY_MS = 5_000;
// Poll the unread badge only while the chat window is closed.
const UNREAD_POLL_MS = 8_000;
const DISMISSED_KEY = "mk-chat-invite-dismissed";
const OPENED_KEY = "mk-chat-opened";

// Require login before opening chat.
export function ChatWidget() {
  const { user, setAuthOpen } = useAuth();
  const [open, setOpen] = useState(false);
  const [invite, setInvite] = useState(false);
  // Open the window the moment a pending guest login lands
  const pendingOpen = useRef(false);
  const prevUnread = useRef(0);

  // Badge count only while the window is closed and signed in
  const [unread] = usePolling<number>(
    async () => {
      try {
        const next = await getMyChatUnreadAction();
        prevUnread.current = next;
        return next;
      } catch {
        return prevUnread.current;
      }
    },
    UNREAD_POLL_MS,
    0,
    Boolean(user) && !open,
  );
  const shown = user ? unread : 0;

  useEffect(() => {
    if (
      sessionStorage.getItem(DISMISSED_KEY) ||
      sessionStorage.getItem(OPENED_KEY)
    ) {
      return;
    }
    const id = window.setTimeout(() => setInvite(true), INVITE_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  const openChat = useCallback(() => {
    if (!user) {
      pendingOpen.current = true;
      setAuthOpen(true);
      return;
    }
    sessionStorage.setItem(OPENED_KEY, "1");
    setInvite(false);
    setOpen(true);
  }, [user, setAuthOpen]);

  useEffect(() => {
    if (user && pendingOpen.current) {
      pendingOpen.current = false;
      openChat();
    }
  }, [user, openChat]);

  function dismissInvite() {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setInvite(false);
  }

  return (
    <>
      {!open ? (
        <Button
          type="button"
          variant="gold"
          size="icon-lg"
          aria-label={
            shown
              ? `گفتگو با پشتیبانی (${toFaDigits(shown)} پیام خوانده‌نشده)`
              : "گفتگو با پشتیبانی"
          }
          aria-expanded={open}
          aria-controls="support-chat-window"
          onClick={openChat}
          className="shadow-gold/40 fixed inset-s-4 bottom-4 z-65 size-14 rounded-full shadow-lg sm:inset-s-6 sm:bottom-6 motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:scale-105 motion-safe:active:scale-95"
        >
          <MessageCircle className="size-6" />
          {shown > 0 ? (
            <span
              // Count-keyed pop-in — new replies re-announce themselves
              key={shown}
              aria-hidden
              className="pointer-events-none absolute -inset-e-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full px-1 bg-rose text-[10px] font-black text-white ring-paper dark:ring-dusk shadow ring-2 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-200"
            >
              {shown > 9 ? "+۹" : toFaDigits(shown)}
            </span>
          ) : null}
        </Button>
      ) : null}

      {invite && !open ? (
        <div
          role="status"
          className="fixed inset-s-4 bottom-20 z-65 w-[min(19rem,calc(100vw-2rem))] sm:inset-s-6 sm:bottom-24 rounded-3xl border p-4 shadow-2xl border-gold/40 bg-paper text-navy dark:border-gold/50 dark:bg-dusk dark:text-ivory motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-300"
        >
          <button
            type="button"
            onClick={dismissInvite}
            aria-label="بستن دعوت به گفتگو"
            className="absolute inset-e-2 top-2 grid size-8 place-items-center rounded-full text-navy/60 hover:bg-navy/5 hover:text-navy dark:text-ivory/60 dark:hover:text-ivory dark:hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
          <p className="text-sm font-black">👋 سلام! نیاز به راهنمایی دارید؟</p>
          <p className="text-navy/70 dark:text-wheat mt-1 text-xs leading-6 font-bold">
            تیم پشتیبانی ملی‌کیدز این‌جاست — سوالتان را همین‌جا بپرسید.
          </p>
          <Button
            type="button"
            variant="navy"
            size="sm"
            onClick={openChat}
            className="mt-3 h-10 w-full rounded-full"
          >
            ارتباط با پشتیبانی
          </Button>
        </div>
      ) : null}

      {open && user ? <ChatWindow onClose={() => setOpen(false)} /> : null}
    </>
  );
}
