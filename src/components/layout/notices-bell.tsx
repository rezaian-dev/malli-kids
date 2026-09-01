"use client";

import {
  Bell,
  BellOff,
  CheckCheck,
  Headphones,
  PackageCheck,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/providers/store-provider";
import {
  markAllRead,
  markRead,
  useNotices,
  type NoticeKind,
} from "@/lib/notifications";
import { toFaDigits } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ICON_BTN } from "./header-styles";

const KIND_ICON: Record<NoticeKind, typeof Bell> = {
  ticket: Headphones,
  order: PackageCheck,
  system: Sparkles,
};

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
          aria-label={
            unread ? `اعلان‌ها (${toFaDigits(unread)} نخوانده)` : "اعلان‌ها"
          }
          className={cn(
            ICON_BTN,
            "group relative",
            "border-gold/70 bg-gold/12 hover:border-gold hover:bg-gold hover:text-navy-deep border-2 transition-colors",
            "dark:border-gold/60 dark:bg-gold/15 dark:hover:bg-gold dark:hover:text-navy-deep",
          )}
        >
          <Bell className="size-5 transition-transform duration-300 group-hover:rotate-12" />
          {unread > 0 ? (
            <Badge
              aria-hidden
              className={cn(
                "pointer-events-none absolute -inset-e-1 -top-1 grid size-5 place-items-center p-0",
                "border-cream bg-rose rounded-full border-2 text-[10px] font-black text-white",
                "dark:border-navy-deep",
              )}
            >
              {unread > 9 ? "+۹" : toFaDigits(unread)}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className={cn(
          "z-80 w-[min(21rem,calc(100vw-2rem))] overflow-hidden p-0",
          "border-gold bg-paper rounded-[22px] border",
          "dark:border-gold/50 dark:bg-dusk",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-2 px-4 py-3",
            "border-gold from-navy to-navy-mid border-b bg-linear-to-br",
            "dark:border-gold/40",
          )}
        >
          <p className="m-0 flex items-center gap-2 text-sm font-black text-white">
            <Bell className="text-gold size-4" /> اعلان‌ها
          </p>
          {unread > 0 ? (
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "h-8 px-3",
                "text-gold-soft hover:text-gold rounded-full text-[10px] font-black hover:bg-white/10",
              )}
              onClick={() => markAllRead(owner)}
            >
              <CheckCheck className="size-3.5" /> خواندنِ همه
            </Button>
          ) : null}
        </div>

        {notices.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <BellOff className="text-gold/60 mx-auto size-8" />
            <p className="text-navy dark:text-ivory mt-3 text-sm font-black">
              اعلانی ندارید
            </p>
            <p className="text-navy/70 dark:text-wheat mt-1 text-[11px] leading-5 font-bold">
              پاسخِ تیکت و وضعیتِ سفارش‌هایتان این‌جا خبرتان می‌کند.
            </p>
          </div>
        ) : (
          <ul className="max-h-96 scrollbar-thin overflow-y-auto p-2">
            {notices.slice(0, 12).map((n) => {
              const Icon = KIND_ICON[n.kind];
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-3 py-3",
                      "hover:bg-gold/10 rounded-2xl text-start transition-colors",
                      !n.read && "bg-gold/8 dark:bg-gold/10",
                    )}
                    title="علامت به‌عنوان خوانده‌شده"
                  >
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center",
                        "bg-gold/15 text-gold rounded-xl",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-navy dark:text-ivory block text-[12px] leading-6 font-bold">
                        {n.text}
                      </span>
                      <span className="text-navy/70 dark:text-wheat mt-0.5 block text-[10px] font-bold">
                        {n.at}
                      </span>
                    </span>
                    {!n.read ? (
                      <span
                        className="bg-rose mt-1.5 size-2 shrink-0 rounded-full"
                        aria-label="نخوانده"
                      />
                    ) : null}
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
