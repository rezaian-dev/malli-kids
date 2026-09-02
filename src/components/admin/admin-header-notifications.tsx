"use client";

import Link from "next/link";
import { Bell, ShoppingBag, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdmin } from "@/lib/admin/admin-store";
import { toFaDigits } from "@/lib/format";
import { useTickets } from "@/lib/tickets";
import { cn } from "@/lib/utils";

/** 🔔 The header bell — pending orders, open tickets, hidden reviews. */
export function AdminHeaderNotifications() {
  const { db } = useAdmin();
  const tickets = useTickets();
  const notices = [
    {
      label: "سفارش جدید",
      hint: "نیازمند شروع پردازش",
      count: db.orders.filter((order) => order.status === "جدید").length,
      href: "/admin/orders",
      Icon: ShoppingBag,
    },
    {
      label: "تیکت باز",
      hint: "در انتظار پاسخ پشتیبانی",
      count: tickets.filter((ticket) => ticket.status === "open").length,
      href: "/admin/messages",
      Icon: Bell,
    },
    {
      label: "نظر پنهان",
      hint: "نیازمند بررسی محتوا",
      count: db.reviews.filter((review) => !review.visible).length,
      href: "/admin/reviews",
      Icon: Sparkles,
    },
  ];
  const total = notices.reduce((sum, notice) => sum + notice.count, 0);

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative hidden size-10 shrink-0 place-items-center rounded-xl border transition md:grid",
            "border-navy/8 text-navy/65 hover:border-gold/35 hover:text-gold bg-white/60",
            "dark:border-gold/14 dark:text-wheat/70 dark:bg-white/[0.035]",
          )}
          aria-label={`${toFaDigits(total)} اعلان مدیریتی`}
        >
          <Bell className="size-4" />
          {total > 0 ? (
            <span
              className={cn(
                "absolute -inset-e-1 -top-1 grid min-w-4 place-items-center rounded-full px-1 text-[8px] leading-4 font-black",
                "bg-rose text-white shadow-[0_0_0_3px_rgba(225,29,72,.1)]",
              )}
            >
              {toFaDigits(total)}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className={cn(
          "w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl p-2 shadow-[0_24px_70px_-26px_rgba(4,20,39,.72)]",
          "border-navy/9 bg-fog/98",
          "dark:border-gold/18 dark:bg-navy-deep/98",
        )}
      >
        <DropdownMenuLabel className="flex items-center justify-between px-2.5 py-2">
          <span className="text-navy dark:text-ivory text-xs font-black">
            مرکز پیگیری
          </span>
          <span className="bg-rose/9 text-rose rounded-lg px-2 py-1 text-[9px] font-black">
            {toFaDigits(total)} مورد
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-navy/7 dark:bg-gold/12" />
        {notices.map((notice) => (
          <DropdownMenuItem
            key={notice.href}
            asChild
            className="focus:bg-gold/8 rounded-xl p-0 dark:focus:bg-white/5"
          >
            <Link
              href={notice.href}
              className="flex w-full items-center gap-3 px-2.5 py-2.5 outline-none"
            >
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-xl",
                  "bg-navy/6 text-gold",
                  "dark:bg-white/6",
                )}
              >
                <notice.Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-navy dark:text-ivory block text-[11px] font-black">
                  {notice.label}
                </span>
                <span
                  className={cn(
                    "mt-0.5 block truncate text-[9px] font-bold",
                    "text-navy/38",
                    "dark:text-wheat/48",
                  )}
                >
                  {notice.hint}
                </span>
              </span>
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-lg text-[10px] font-black",
                  "bg-navy text-gold",
                  "dark:bg-gold dark:text-navy-deep",
                )}
              >
                {toFaDigits(notice.count)}
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
