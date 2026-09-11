"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Eye, PackageX, ShoppingBag, Star } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import type { Product } from "@/types";
import { toFaDigits } from "@/lib/locale/fa";
import { EASE_OUT, TiltCard } from "@/components/motion";
import { AddToCartButton } from "./add-to-cart-button";
import { FavButton } from "./fav-button";
import { CART, VIEW } from "./card-styles";
import { cn } from "@/lib/utils";

const BADGE: Record<string, string> = {
  پرفروش: "bg-navy text-gold-light",
  جدید: "bg-gold text-navy-deep",
  "منتخب مادران": "bg-white text-ink",
};

const GRID_SIZES =
  "(max-width: 479px) calc(100vw - 2.5rem), (max-width: 719px) calc((100vw - 4.5rem) / 2), (max-width: 1023px) calc((100vw - 5.5rem) / 2), (max-width: 1535px) 33vw, 18rem";

// 🃏 Spring "settle" for the `stack` transition (styles filter reorder) —
// overdamped on purpose (damping > 2·√(stiffness·mass)) so cards arrive
// crisply with no visible bounce; physical, not a linear CSS tween.
const STACK_SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 38,
  mass: 0.7,
} as const;

/** 🖼️ The tall grid card used everywhere except the shop's list view. */
export function ProductCardGrid({
  p,
  href,
  out,
  sold,
  price,
  imageProps,
  animate = true,
  index,
  stack = false,
}: {
  p: Product;
  href: string;
  out: boolean;
  sold: ReactNode;
  price: ReactNode;
  imageProps: {
    loading?: "eager";
    fetchPriority?: "high";
  };
  animate?: boolean;
  /** 🃏 موقعیت کارت در گرید فعلی — فقط برای یک stagger بسیار جزئی در ورودِ حالت `stack`. */
  index?: number;
  /** 🃏 حالت «دستهٔ کارت»: به‌جای ورودِ اسکرول‌محور (`whileInView`)، ورود/خروج
   *  synced با AnimatePresence والد اجرا می‌شود — برای بازچیدمانِ فیلتر
   *  (مثل «استایل‌های منتخب»)، نه برای reveal حین اسکرول. */
  stack?: boolean;
}) {
  const badge = p.badge ? BADGE[p.badge] || "bg-navy text-gold-light" : null;
  // 🃏 جهتِ چرخشِ خیلی جزئیِ هر کارت در حالت stack، برگرفته از id — یک دسته
  // کارت هیچ‌وقت همه دقیقاً یک‌شکل نمی‌چرخند.
  const tilt = p.id % 2 === 0 ? 1 : -1;

  return (
    <motion.div
      layout
      className="h-full min-w-0"
      {...(stack
        ? {
            // 🃏 خروج: کارت مثل جداشدن از یک دستهٔ کارت به‌سمتِ انتهای خواندن
            // (چپ، چون RTL) می‌لغزد — لغزشِ افقی کور نیست، جهتش عمداً است.
            exit: {
              opacity: 0,
              scale: 0.94,
              x: -26,
              y: tilt * 4,
              rotate: tilt * -1.6,
              transition: { duration: 0.22, ease: EASE_OUT },
            },
            transition: STACK_SPRING,
            ...(animate
              ? {
                  // 🃏 ورود: از سمتِ شروعِ خواندن (راست، چون RTL) و کمی از بالا
                  // می‌آید و با اسپرینگ در جای خودش می‌نشیند.
                  initial: {
                    opacity: 0,
                    scale: 0.96,
                    x: 20,
                    y: 14,
                    rotate: tilt * 1.2,
                  },
                  animate: {
                    opacity: 1,
                    scale: 1,
                    x: 0,
                    y: 0,
                    rotate: 0,
                    transition: {
                      ...STACK_SPRING,
                      delay: Math.min(index ?? 0, 10) * 0.02,
                    },
                  },
                }
              : {}),
          }
        : {
            // ⚡ بدون ورودِ whileInView: کارت بی‌درنگ رندر می‌شود تا با رفرش،
            // گرید یک‌ضرب و بدون «پاپ» شدنِ تکه‌تکه دیده شود. `layout` و `exit`
            // می‌مانند تا تعویضِ فیلتر/صفحه همچنان نرم باشد.
            exit: {
              opacity: 0,
              scale: 0.85,
              transition: { duration: 0.25, ease: EASE_OUT },
            },
          })}
    >
      <TiltCard className="h-full rounded-3xl">
        <article
          className={cn(
            "group @container flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border transition-all duration-500 ease-out",
            "border-navy/10 hover:border-gold/55 bg-white/94 shadow-[0_10px_28px_-18px_rgba(14,42,71,.22)] hover:-translate-y-2 hover:shadow-[0_26px_48px_-18px_rgba(14,42,71,.32)]",
            "dark:border-gold-soft/35 dark:bg-slate/60 dark:shadow-none",
          )}
        >
          <div className="bg-sand relative w-full shrink-0 overflow-hidden pt-[125%]">
            <Image
              src={p.img}
              alt={p.name}
              width={600}
              height={800}
              sizes={GRID_SIZES}
              {...imageProps}
              className={cn(
                "absolute inset-0 size-full max-w-none object-cover transition-transform duration-700 ease-out",
                out ? "opacity-75 grayscale" : "group-hover:scale-110",
              )}
            />
            {badge ? (
              <span
                className={cn(
                  "absolute inset-e-2.5 top-2.5 z-2 rounded-full px-2.5 py-1 text-[10px] font-black whitespace-nowrap",
                  badge,
                )}
              >
                {p.badge}
              </span>
            ) : null}
            <FavButton
              id={p.id}
              name={p.name}
              className="absolute inset-s-2.5 top-2.5"
            />
            {out ? (
              <div className="bg-navy/35 absolute inset-0 z-1 flex items-center justify-center">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-black",
                    "text-navy bg-white",
                  )}
                >
                  <PackageX width={14} height={14} /> ناموجود
                </span>
              </div>
            ) : null}
            <div className="absolute inset-x-2.5 bottom-2.5 z-4 hidden translate-y-[130%] flex-col gap-1.5 transition-all duration-500 ease-out group-hover:translate-y-0 pointer-fine:min-[520px]:flex">
              <Link
                href={href}
                prefetch={false}
                className={cn(
                  VIEW,
                  "h-10 w-full rounded-[14px] text-xs shadow-md",
                )}
              >
                <Eye width={16} height={16} /> مشاهده محصول
              </Link>
              <AddToCartButton
                out={out}
                id={p.id}
                className={cn(
                  CART,
                  "h-10 w-full rounded-[14px] text-xs shadow-md",
                )}
              >
                {out ? (
                  <>
                    <Bell width={16} height={16} /> اطلاع از موجودی
                  </>
                ) : (
                  <>
                    <ShoppingBag width={16} height={16} /> افزودن به سبد خرید
                  </>
                )}
              </AddToCartButton>
            </div>
          </div>
          <div className="flex flex-1 flex-col px-3 pt-3 pb-3.5">
            <div
              className={cn(
                "flex min-w-0 items-center gap-1 text-[11px]",
                "text-navy/70",
                "dark:text-khaki",
              )}
            >
              <Star className="fill-gold text-gold size-3.5" />
              <b className="text-navy dark:text-ivory">{toFaDigits(p.rate)}</b>
              <span>·</span>
              <span className="truncate">{p.cat}</span>
            </div>
            <h3
              className={cn(
                "mt-1.5 mb-0 truncate text-sm leading-snug font-black",
                "text-navy",
                "dark:text-ivory",
              )}
            >
              {p.name}
            </h3>
            {sold}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {out ? (
                <span className="text-navy/70 dark:text-wheat text-xs font-bold">
                  به‌زودی موجود می‌شود
                </span>
              ) : (
                price
              )}
            </div>
            {/* 📱 Keep actions visible under the price on narrow screens, pinned to the card's bottom edge. */}
            <div className="mt-auto grid grid-cols-1 gap-1.5 pt-2.5 pointer-fine:min-[520px]:hidden">
              <Link
                href={href}
                prefetch={false}
                className={cn(
                  VIEW,
                  "h-9 min-w-0 text-[11px] whitespace-nowrap",
                )}
              >
                <Eye width={13} height={13} className="shrink-0" />{" "}
                <span className="truncate">مشاهده</span>
              </Link>
              <AddToCartButton
                out={out}
                id={p.id}
                className={cn(
                  out ? "bg-rose-50 text-[#be123c]" : CART,
                  "h-9 min-w-0 rounded-[10px] border-0 text-[11px] font-black whitespace-nowrap",
                )}
              >
                {out ? "اطلاع موجودی" : "افزودن به سبد"}
              </AddToCartButton>
            </div>
          </div>
        </article>
      </TiltCard>
    </motion.div>
  );
}
