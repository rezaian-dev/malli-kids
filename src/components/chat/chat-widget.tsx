"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toFaDigits } from "@/lib/locale/fa";
import { usePolling } from "@/hooks/use-polling";
import { getMyChatUnreadAction } from "@/lib/shop/chat-actions";

// 🪶 The window (messages, polling, composer) only downloads when the chat
// is actually opened — the bubble + invitation below are the whole
// always-on cost of this feature.
const ChatWindow = dynamic(
  () => import("./chat-window").then((m) => m.ChatWindow),
  { ssr: false },
);

const INVITE_DELAY_MS = 5_000;
// 🔴 Same rhythm as the header bells — one indexed document read per tick,
// only while signed in with the window closed.
const UNREAD_POLL_MS = 8_000;
const DISMISSED_KEY = "mk-chat-invite-dismissed";
const OPENED_KEY = "mk-chat-opened";

/** 💬 The storefront's floating support entry: an always-there bubble plus
 *  one delayed, dismissible invitation card. Mounted once in
 *  `StorefrontEnhancements`, so it never remounts (or re-invites) on route
 *  changes. Guests are routed to the login dialog — chat itself is
 *  authenticated-only in the MVP (no guest identity infra to secure). */
export function ChatWidget() {
  const { user, setAuthOpen } = useStore();
  const [open, setOpen] = useState(false);
  const [invite, setInvite] = useState(false);
  // 🚪 A guest tapped "talk to support" before signing in — open the real
  // window the moment the login lands instead of making them tap again.
  const pendingOpen = useRef(false);
  const prevUnread = useRef(0);

  // 🔴 Badge count while the window is closed — stops the moment the
  // window opens (its own poll takes over) or the user signs out.
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
          className={cn(
            "shadow-gold/40 fixed inset-s-4 bottom-4 z-65 size-14 rounded-full shadow-lg",
            "sm:inset-s-6 sm:bottom-6",
            "motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:scale-105 motion-safe:active:scale-95",
          )}
        >
          <MessageCircle className="size-6" />
          {shown > 0 ? (
            <span
              // 🔑 Replays the pop-in every time the count itself changes —
              // a new reply re-announces itself without any timer or pulse
              // loop running in the background.
              key={shown}
              aria-hidden
              className={cn(
                "pointer-events-none absolute -inset-e-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full px-1",
                "bg-rose text-[10px] font-black text-white",
                "ring-paper dark:ring-dusk shadow ring-2",
                "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-200",
              )}
            >
              {shown > 9 ? "+۹" : toFaDigits(shown)}
            </span>
          ) : null}
        </Button>
      ) : null}

      {invite && !open ? (
        <div
          role="status"
          className={cn(
            "fixed inset-s-4 bottom-20 z-65 w-[min(19rem,calc(100vw-2rem))]",
            "sm:inset-s-6 sm:bottom-24",
            "rounded-3xl border p-4 shadow-2xl",
            "border-gold/40 bg-paper text-navy",
            "dark:border-gold/50 dark:bg-dusk dark:text-ivory",
            "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-300",
          )}
        >
          <button
            type="button"
            onClick={dismissInvite}
            aria-label="بستن دعوت به گفتگو"
            className={cn(
              "absolute inset-e-2 top-2 grid size-8 place-items-center rounded-full",
              "text-navy/60 hover:bg-navy/5 hover:text-navy",
              "dark:text-ivory/60 dark:hover:text-ivory dark:hover:bg-white/10",
            )}
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
