"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { toFaDigits } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ICON_BTN, PANEL, PANEL_HEAD } from "./header-styles";

/**
 * سبد خرید — پوستهٔ UI با شمارندهٔ نمایشی.
 * client چون Sheet باز/بسته می‌شود و شمارنده از استور می‌آید.
 */
export function CartSheet() {
  const { cartCount, clearCart } = useStore();
  const empty = cartCount === 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          aria-label={empty ? "سبد خرید (خالی)" : `سبد خرید (${toFaDigits(cartCount)} قلم)`}
          className={cn(
            ICON_BTN,
            "group relative border-2 transition-colors",
            "border-gold/70 bg-gold/12 hover:border-gold hover:bg-gold hover:text-navy-deep",
            "dark:border-gold/60 dark:bg-gold/15 dark:hover:bg-gold dark:hover:text-navy-deep",
          )}
        >
          <ShoppingBag className="size-5 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />

          {/* بج تعداد — عدد فارسی، +۹۹ برای مقادیر بزرگ */}
          <Badge
            aria-hidden
            className={cn(
              "pointer-events-none absolute -end-1 -top-1 justify-center rounded-full border-2 p-0 tabular-nums",
              "border-cream bg-navy text-[10px] font-black text-gold",
              "dark:border-navy-deep dark:bg-navy dark:text-gold-light",
              cartCount > 9 ? "h-5 min-w-5 px-1" : "size-5",
              empty && "hidden",
            )}
          >
            {cartCount > 99 ? "+۹۹" : toFaDigits(cartCount)}
          </Badge>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" dir="rtl" className={cn(PANEL, "w-[min(22rem,92vw)]")}>
        <SheetHeader className={PANEL_HEAD}>
          <SheetTitle className="flex items-center gap-2 text-start text-base font-black text-cream">
            <span className="grid size-9 place-items-center rounded-2xl bg-gold text-navy-deep">
              <ShoppingBag className="size-4.5" />
            </span>
            سبد خرید
            {!empty ? (
              <Badge className="ms-auto rounded-full border-0 bg-gold/20 text-[10px] font-bold text-gold">
                {toFaDigits(cartCount)} قلم
              </Badge>
            ) : null}
          </SheetTitle>
          <SheetDescription className="text-start text-[11px] font-bold text-gold-soft">
            گالری ملی‌کیدز — خرید آنلاین به‌زودی
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <span
            className={cn(
              "grid size-24 place-items-center rounded-full",
              "bg-linear-to-br from-gold-pale to-sand text-navy",
              "dark:from-dusk-alt dark:to-dusk-mid dark:text-gold",
            )}
          >
            <ShoppingBag className="size-10" />
          </span>
          <div>
            <p className="text-base font-black text-navy dark:text-ivory">
              {empty ? "سبد شما خالی است" : `${toFaDigits(cartCount)} قلم انتخاب شده`}
            </p>
            <p className="mx-auto mt-1.5 max-w-[15rem] text-xs leading-6 text-navy/50 dark:text-wheat/80">
              {empty
                ? "کالکشن دوخت‌های تازه را ببینید؛ امکان ثبت سفارش آنلاین به‌زودی فعال می‌شود."
                : "این نسخه نمایشی است و سفارش ثبت نمی‌شود؛ به‌زودی پرداخت آنلاین اضافه می‌شود."}
            </p>
          </div>
          <Badge className="rounded-full border-0 bg-gold/15 px-3 py-1 text-[10px] font-bold text-gold">
            <Sparkles className="me-1 size-3" /> نسخهٔ نمایشی
          </Badge>
        </div>

        <SheetFooter className="gap-2 border-t border-navy/10 px-5 py-4 dark:border-gold/20">
          {!empty ? (
            <>
              <Button
                variant="ghost"
                onClick={clearCart}
                className="h-11 w-full rounded-2xl text-xs font-bold text-rose hover:bg-rose/10 hover:text-rose"
              >
                <Trash2 className="size-4" /> خالی کردن سبد
              </Button>
              <Separator className="bg-navy/10 dark:bg-gold/20" />
            </>
          ) : null}

          <SheetClose asChild>
            <Button
              asChild
              className={cn(
                "h-11 w-full rounded-2xl text-xs font-black",
                "bg-navy text-cream hover:bg-navy-mid",
                "dark:bg-gold dark:text-navy-deep dark:hover:bg-gold-light",
              )}
            >
              <Link href="/shop">
                مشاهدهٔ کالکشن <ArrowLeft className="size-4" />
              </Link>
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
