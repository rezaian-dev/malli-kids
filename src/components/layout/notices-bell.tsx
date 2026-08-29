"use client";

import { Bell, BellOff, CheckCheck, Headphones, PackageCheck, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { markAllRead, markRead, useNotices, type NoticeKind } from "@/lib/notifications";
import { toFaDigits } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ICON_BTN } from "./header-styles";

const KIND_ICON: Record<NoticeKind, typeof Bell> = {
  ticket: Headphones,
  order: PackageCheck,
  system: Sparkles,
};

/**
 * زنگولهٔ اعلان‌ها — فقط برای کاربرِ واردشده.
 * پاسخِ تیکت و تغییرِ وضعیتِ سفارش این‌جا چراغ می‌اندازد تا کاربر بدونِ
 * گشتنِ پنل متوجه شود؛ کلیک روی هر اعلان آن را خوانده می‌کند.
 */
export function NoticesBell() {
  const { user } = useStore();
  const owner = user?.email || user?.phone || "";
  const notices = useNotices(owner);

  if (!user) return null;

  const unread = notices.filter((n) => !n.read).length;

  return (
    <DropdownMenu dir="rtl" modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          aria-label={unread ? `اعلان‌ها (${toFaDigits(unread)} نخوانده)` : "اعلان‌ها"}
          className={cn(
            ICON_BTN,
            "group relative border-2 border-gold/70 bg-gold/12 transition-colors hover:border-gold hover:bg-gold hover:text-navy-deep",
            "dark:border-gold/60 dark:bg-gold/15 dark:hover:bg-gold dark:hover:text-navy-deep",
          )}
        >
          <Bell className="size-5 transition-transform duration-300 group-hover:rotate-12" />
          {unread > 0 ? (
            <Badge
              aria-hidden
              className="pointer-events-none absolute -end-1 -top-1 grid size-5 place-items-center rounded-full border-2 border-cream bg-rose p-0 text-[10px] font-black text-white dark:border-navy-deep"
            >
              {unread > 9 ? "+۹" : toFaDigits(unread)}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="z-[80] w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-[22px] border border-gold bg-paper p-0 dark:border-gold/50 dark:bg-dusk"
      >
        <div className="flex items-center justify-between gap-2 border-b border-gold bg-linear-to-br from-navy to-navy-mid px-4 py-3 dark:border-gold/40">
          <p className="m-0 flex items-center gap-2 text-sm font-black text-white">
            <Bell className="size-4 text-gold" /> اعلان‌ها
          </p>
          {unread > 0 ? (
            <Button
              type="button"
              variant="ghost"
              className="h-8 rounded-full px-3 text-[10px] font-black text-gold-soft hover:bg-white/10 hover:text-gold"
              onClick={() => markAllRead(owner)}
            >
              <CheckCheck className="size-3.5" /> خواندنِ همه
            </Button>
          ) : null}
        </div>

        {notices.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <BellOff className="mx-auto size-8 text-gold/60" />
            <p className="mt-3 text-sm font-black text-navy dark:text-ivory">اعلانی ندارید</p>
            <p className="mt-1 text-[11px] font-bold leading-5 text-navy/50 dark:text-wheat">
              پاسخِ تیکت و وضعیتِ سفارش‌هایتان این‌جا خبرتان می‌کند.
            </p>
          </div>
        ) : (
          <ul className="max-h-96 overflow-y-auto p-2 [scrollbar-width:thin]">
            {notices.slice(0, 12).map((n) => {
              const Icon = KIND_ICON[n.kind];
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-start transition-colors hover:bg-gold/10",
                      !n.read && "bg-gold/8 dark:bg-gold/10",
                    )}
                    title="علامت به‌عنوان خوانده‌شده"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-bold leading-6 text-navy dark:text-ivory">{n.text}</span>
                      <span className="mt-0.5 block text-[10px] font-bold text-navy/40 dark:text-wheat">{n.at}</span>
                    </span>
                    {!n.read ? <span className="mt-1.5 size-2 shrink-0 rounded-full bg-rose" aria-label="نخوانده" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
