"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, Minus, Plus, RotateCcw, Ruler, ShieldCheck, ShoppingBag, Sparkles, Star, Truck } from "lucide-react";
import type { Product } from "@/types";
import { formatToman, toFaDigits } from "@/lib/format";
import { useStore } from "@/lib/store";
import { CORE_PRODUCTS } from "@/lib/data/products";
import { Button } from "@/components/ui/button";

const SIZES = ["۸۰", "۸۶", "۹۲", "۹۸", "۱۰۴", "۱۱۰", "۱۱۶", "۱۲۲"];

export function Buy({ product }: { product: Product }) {
  const { addToCart, favs, toggleFav } = useStore();
  const [size, setSize] = useState("۹۸");
  const [qty, setQty] = useState(1);
  const [slide, setSlide] = useState(0);
  const liked = favs.includes(product.name);

  const gallery = useMemo(() => {
    const imgs = [product.img];
    CORE_PRODUCTS.forEach((x) => {
      if (x.img !== product.img && imgs.length < 5) imgs.push(x.img);
    });
    return imgs;
  }, [product.img]);

  const go = (n: number) => setSlide((n + gallery.length) % gallery.length);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
      <div className="lg:sticky lg:top-24">
        <div
          className="relative aspect-4/5 select-none overflow-hidden rounded-[28px] bg-sand shadow-2xl shadow-navy/15 sm:rounded-[36px]"
          onTouchStart={(e) => {
            e.currentTarget.dataset.x = String(e.changedTouches[0].clientX);
          }}
          onTouchEnd={(e) => {
            const start = Number(e.currentTarget.dataset.x || 0);
            const dx = e.changedTouches[0].clientX - start;
            if (Math.abs(dx) > 40) go(slide + (dx > 0 ? -1 : 1));
          }}
        >
          <div className="absolute inset-0 flex h-full transition-transform duration-500" style={{ transform: `translateX(${-slide * 100}%)` }}>
            {gallery.map((src) => (
              <img key={src} src={src} alt={product.name} className="h-full w-full shrink-0 object-cover" />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-4 top-4 z-10 flex justify-between">
            {product.disc ? <span className="rounded-full bg-rose px-3 py-1.5 text-[11px] font-black text-white">{product.disc} تخفیف</span> : <span />}
            {product.badge ? (
              <span className={`ms-auto rounded-full px-3 py-1.5 text-[11px] font-black ${product.badge === "جدید" ? "bg-gold text-navy-deep" : "bg-navy text-gold-light"}`}>
                {product.badge}
              </span>
            ) : null}
          </div>
          <button type="button" className="absolute start-3 top-1/2 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy" aria-label="قبلی" onClick={() => go(slide - 1)}>
            <ChevronRight className="size-5" />
          </button>
          <button type="button" className="absolute end-3 top-1/2 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy" aria-label="بعدی" onClick={() => go(slide + 1)}>
            <ChevronLeft className="size-5" />
          </button>
          <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-1.5">
            {gallery.map((_, i) => (
              <button key={i} type="button" aria-label={`اسلاید ${i + 1}`} onClick={() => go(i)} className={`h-2 rounded-full ${i === slide ? "w-6 bg-gold" : "w-2 bg-white/70"}`} />
            ))}
          </div>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {gallery.map((src, i) => (
            <button key={src} type="button" onClick={() => go(i)} className={`h-18 w-18 shrink-0 overflow-hidden rounded-2xl border-2 ${i === slide ? "border-gold ring-2 ring-gold/30" : "border-transparent opacity-70"}`}>
              <img src={src} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-bold tracking-wide text-gold">{product.cat}</p>
        <h1 className="mt-2 text-[clamp(1.5rem,4vw,2.25rem)] font-black leading-snug text-navy dark:text-ivory">{product.name}</h1>
        <div className="mt-3 flex items-center gap-2">
          <span className="flex gap-0.5" aria-hidden>
            {[0, 1, 2, 3, 4].map((n) => <Star key={n} className="size-4 fill-gold text-gold" />)}
          </span>
          <span className="font-black text-navy dark:text-ivory">{product.rate}</span>
          <span className="text-xs text-navy/40 dark:text-wheat">امتیاز خریداران تأییدشده</span>
        </div>
        <p className="mt-5 text-sm leading-8 text-navy/60 dark:text-wheat sm:text-[15px]">{product.desc}</p>

        <div className="mt-6 rounded-[28px] border border-navy/5 bg-white p-5 shadow-xl shadow-navy/5 dark:border-gold/30 dark:bg-dusk sm:p-6">
          <p className="mb-1 text-[11px] font-bold text-navy/40 dark:text-wheat">قیمت</p>
          <div className="flex flex-wrap items-end gap-2">
            <span className="text-[1.75rem] font-black leading-none text-navy dark:text-ivory">
              {formatToman(product.price)} <span className="text-sm font-medium text-navy/45 dark:text-gold-soft">تومان</span>
            </span>
            {product.old ? <span className="pb-0.5 text-sm text-navy/35 line-through">{formatToman(product.old)}</span> : null}
          </div>
          <p className="mt-6 mb-2.5 flex items-center gap-1.5 text-xs font-black text-navy dark:text-ivory">
            <Ruler className="size-4 text-gold" /> انتخاب سایز
          </p>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <button key={s} type="button" onClick={() => setSize(s)} className={`rounded-xl border-2 px-3.5 py-2 text-xs font-bold ${size === s ? "border-navy bg-navy text-ivory dark:border-gold dark:bg-gold dark:text-navy-deep" : "border-navy/10 text-navy/60 dark:border-gold/30 dark:text-ivory"}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-xs font-black text-navy dark:text-ivory">تعداد</p>
            <div className="inline-flex items-center gap-1 rounded-full border border-navy/10 bg-sand p-1 dark:border-gold/30 dark:bg-night">
              <button type="button" className="flex size-10 items-center justify-center rounded-full bg-white dark:bg-slate" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="کم کردن">
                <Minus className="size-4" />
              </button>
              <span className="w-10 text-center text-base font-black tabular-nums">{toFaDigits(qty)}</span>
              <button type="button" className="flex size-10 items-center justify-center rounded-full bg-navy text-cream" onClick={() => setQty((q) => q + 1)} aria-label="زیاد کردن">
                <Plus className="size-4" />
              </button>
            </div>
          </div>
          <div className="mt-7 flex gap-2.5">
            <Button type="button" variant="navy" disabled={!product.stock} className="h-12 flex-1 rounded-2xl font-black" onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, img: product.img, size }, qty)}>
              <ShoppingBag className="size-4" />
              {product.stock ? "افزودن به سبد" : "ناموجود"}
            </Button>
            <button type="button" className={`flex w-14 items-center justify-center rounded-2xl border-2 text-rose ${liked ? "border-rose bg-rose-pale" : "border-navy/12 bg-white"}`} onClick={() => toggleFav(product.name)} aria-label="علاقه‌مندی">
              <Heart className="size-5" fill={liked ? "currentColor" : "none"} />
            </button>
          </div>
          <Button asChild variant="outline" className="mt-2.5 h-12 w-full rounded-2xl border-2 border-gold font-black text-gold hover:bg-gold hover:text-navy-deep">
            <Link href="/tryon"><Sparkles className="size-4" /> پرو مجازی این لباس</Link>
          </Button>
        </div>

        <ul className="mt-5 grid grid-cols-3 gap-2 text-[11px] text-navy/60 dark:text-wheat">
          <li className="lux-card px-2 py-3 text-center hover:translate-y-0"><Truck className="mx-auto mb-1 size-4 text-gold" /> ارسال ۲–۴ روز</li>
          <li className="lux-card px-2 py-3 text-center hover:translate-y-0"><RotateCcw className="mx-auto mb-1 size-4 text-gold" /> ۷ روز بازگشت</li>
          <li className="lux-card px-2 py-3 text-center hover:translate-y-0"><ShieldCheck className="mx-auto mb-1 size-4 text-gold" /> ضدحساسیت</li>
        </ul>
      </div>
    </div>
  );
}
