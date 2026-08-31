"use client";

import Image from "next/image";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Minus, Plus, RotateCcw, Ruler, ShieldCheck, ShoppingBag, Sparkles, Star, Truck } from "lucide-react";
import { SliderArrow } from "@/components/ui/slider-arrow";
import type { Product } from "@/types";
import { formatToman, fullName, toFaDigits } from "@/lib/format";
import { useStore } from "@/providers/store-provider";
import { CORE_PRODUCTS } from "@/lib/data/products";
import { phoneDigits, toLatinDigits } from "@/lib/forms";
import { loadCoupons } from "@/lib/admin-sync";
import { Ticket } from "lucide-react";
import { BRAND } from "@/lib/constants";
import { createOrder, SHIPPING_FEE } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLiveProduct } from "./product-live-context";

const SIZES = ["۸۰", "۸۶", "۹۲", "۹۸", "۱۰۴", "۱۱۰", "۱۱۶", "۱۲۲"];

export function ProductBuyPanel({ product: seed }: { product: Product }) {
  
  const product = useLiveProduct(seed);
  const { addToCart, showToast, user, setAuthOpen, campaign, priceOf } = useStore();
  const [size, setSize] = useState("۹۸");
  const [qty, setQty] = useState(1);
  const [slide, setSlide] = useState(0);
  const [checkout, setCheckout] = useState(false);
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [couponIn, setCouponIn] = useState("");
  const [applied, setApplied] = useState<{ code: string; rate: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponBad, setCouponBad] = useState(false);

  const unit = priceOf(product.price);
  const subtotal = unit * qty;
  const shipping = subtotal >= BRAND.freeShipFrom ? 0 : SHIPPING_FEE;
  const discount = applied ? Math.round(subtotal * applied.rate) : 0;

  function applyCoupon() {
    const code = toLatinDigits(couponIn).trim().toUpperCase();
    if (!code) return;
    const hit = loadCoupons().find((c) => c.code.toUpperCase() === code);
    if (hit && hit.rate > 0 && hit.active !== false) {
      if (hit.min && subtotal < hit.min) {
        setApplied(null);
        setCouponBad(true);
        setCouponMsg(`این کد برای خریدهای بالای ${formatToman(hit.min)} تومان است.`);
        return;
      }
      setApplied({ code: hit.code, rate: hit.rate });
      setCouponBad(false);
      setCouponMsg("");
      showToast(`کد ${hit.code} اعمال شد — ${toFaDigits(Math.round(hit.rate * 100))}٪ تخفیف 🎉`);
    } else {
      setApplied(null);
      setCouponBad(true);
      setCouponMsg("");
    }
  }

  
  function openCheckout() {
    if (!product.stock) return showToast("به محض موجود شدن خبرتان می‌کنیم");
    if (!user) {
      setAuthOpen(true);
      showToast("برای ثبت سفارش اول وارد شوید");
      return;
    }
    setCity(user.city || "");
    setAddress(user.address || "");
    setPhone(user.phone || "");
    setCheckout(true);
  }

  function submitOrder() {
    if (!user) return;
    if (city.trim().length < 2) return showToast("شهر را بنویسید");
    if (address.trim().length < 10) return showToast("آدرس کامل را بنویسید");
    if (phoneDigits(phone).length !== 11) return showToast("شمارهٔ موبایل ۱۱ رقمی بنویسید");
    const order = createOrder({
      owner: user.email || user.phone || "",
      customer: fullName(user.firstName, user.lastName),
      phone: phoneDigits(phone),
      city: city.trim(),
      address: address.trim(),
      items: [{ id: product.id, name: product.name, img: product.img, size, qty, price: unit }],
      discount,
    });
    setCheckout(false);
    showToast(`سفارش ${order.id} ثبت شد؛ از تب «سفارش‌های من» پیگیری کنید ✅`);
  }

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
      {}
      <div className="min-w-0 lg:sticky lg:top-24">
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
            {gallery.map((src, index) => (
              <Image
                key={src}
                src={src}
                alt={product.name}
                width={900}
                height={1200}
                preload={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="(max-width: 1023px) 100vw, 44vw"
                className="h-full w-full shrink-0 object-cover"
              />
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
          <SliderArrow chevron direction="prev" label="قبلی" onClick={() => go(slide - 1)} className="absolute inset-s-3 top-1/2 z-10 -translate-y-1/2" />
          <SliderArrow chevron direction="next" label="بعدی" onClick={() => go(slide + 1)} className="absolute inset-e-3 top-1/2 z-10 -translate-y-1/2" />
          <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-1.5">
            {gallery.map((_, i) => (
              <button key={i} type="button" aria-label={`اسلاید ${i + 1}`} onClick={() => go(i)} className={`h-2 rounded-full ${i === slide ? "w-6 bg-gold" : "w-2 bg-white/70"}`} />
            ))}
          </div>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {gallery.map((src, i) => (
            <button key={src} type="button" onClick={() => go(i)} className={`h-18 w-18 shrink-0 overflow-hidden rounded-2xl border-2 ${i === slide ? "border-gold ring-2 ring-gold/30" : "border-transparent opacity-70"}`}>
              <Image src={src} alt="" width={96} height={96} className="size-full object-cover" />
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
              {formatToman(unit)} <span className="text-sm font-medium text-navy/45 dark:text-gold-soft">تومان</span>
              {campaign.active && unit < product.price ? (
                <s className="me-2 text-sm text-silver line-through">{formatToman(product.price)}</s>
              ) : null}
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
          <div className="mt-7">
            <Button
              type="button"
              variant="navy"
              disabled={!product.stock}
              className="h-12 w-full rounded-2xl font-black"
              onClick={() => {
                if (!product.stock) return showToast("به محض موجود شدن خبرتان می‌کنیم");
                addToCart(product.id, size, qty);
                showToast(`${toFaDigits(qty)} عدد سایز ${size} به سبد اضافه شد`);
              }}
            >
              <ShoppingBag className="size-4" />
              {product.stock ? `افزودن به سبد — سایز ${size} × ${toFaDigits(qty)}` : "ناموجود"}
            </Button>
          </div>
          <Button type="button" variant="gold" disabled={!product.stock} className="mt-2.5 h-12 w-full rounded-2xl font-black" onClick={openCheckout}>
            <BadgeCheck className="size-4" /> ثبت سفارش — پرداخت هنگامِ تحویل
          </Button>
          <Button asChild variant="outline" className="mt-2.5 h-12 w-full rounded-2xl border-2 border-gold font-black text-gold hover:bg-gold hover:text-navy-deep">
            <Link href="/tryon"><Sparkles className="size-4" /> پرو مجازی این لباس</Link>
          </Button>
        </div>

        {}
        <Dialog open={checkout} onOpenChange={setCheckout}>
          <DialogContent dir="rtl" showCloseButton className="max-w-md rounded-3xl border border-gold/40 bg-paper text-navy dark:border-gold/50 dark:bg-dusk dark:text-ivory">
            <DialogTitle className="flex items-center gap-2 text-base font-black">
              <BadgeCheck className="size-5 text-gold" /> ثبت سفارش
            </DialogTitle>

            <div className="flex items-center gap-3 rounded-2xl border border-navy/10 bg-white p-3 dark:border-gold/25 dark:bg-navy-deep/50">
              { }
              <Image src={product.img} alt="" width={56} height={56} className="size-14 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black">{product.name}</p>
                <p className="mt-0.5 text-[11px] font-bold text-navy/50 dark:text-wheat">سایز {size} × {toFaDigits(qty)}</p>
              </div>
              <span className="text-sm font-black text-gold">{formatToman(subtotal)}</span>
            </div>

            <div className="space-y-1 text-xs font-bold text-navy/60 dark:text-wheat">
              <p className="flex justify-between"><span>جمعِ کالا</span><span>{formatToman(subtotal)} تومان</span></p>
              <p className="flex justify-between"><span>ارسال</span><span>{shipping ? `${formatToman(shipping)} تومان` : "رایگان 🎉"}</span></p>
              {discount ? (
                <p className="flex justify-between text-emerald-600 dark:text-emerald-300"><span>تخفیف کد {applied?.code}</span><span>− {formatToman(discount)} تومان</span></p>
              ) : null}
              <p className="flex justify-between text-sm font-black text-navy dark:text-ivory"><span>قابل پرداخت</span><span>{formatToman(subtotal - discount + shipping)} تومان</span></p>
            </div>

            <div className="space-y-2.5">
              <Input dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0912…" inputMode="tel" className="h-11 rounded-xl text-right" aria-label="موبایل" />
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="شهر" className="h-11 rounded-xl" aria-label="شهر" />
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="آدرس کامل" className="h-11 rounded-xl" aria-label="آدرس" />
              <div className="flex gap-2">
                <Input
                  dir="ltr"
                  value={couponIn}
                  onChange={(e) => {
                    setCouponIn(e.target.value);
                    setCouponBad(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                  placeholder="MALLI10"
                  aria-label="کد تخفیف"
                  className={`h-11 flex-1 rounded-xl text-right uppercase ${couponBad ? "border-rose focus-visible:ring-rose" : ""}`}
                />
                <Button type="button" variant="outline" className="h-11 shrink-0 rounded-xl border-gold/50 text-gold-deep dark:text-gold-soft" onClick={applyCoupon}>
                  <Ticket className="size-4" /> اعمال کد
                </Button>
              </div>
              {applied ? (
                <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-300">کد {applied.code} فعال است ✓</p>
              ) : couponBad ? (
                <p className="text-[11px] font-black text-rose">{couponMsg || "این کد معتبر نیست."}</p>
              ) : null}
            </div>

            <Button type="button" variant="navy" className="h-12 w-full rounded-2xl font-black" onClick={submitOrder}>
              تأیید و ثبتِ سفارش
            </Button>
            <p className="text-center text-[10px] font-bold leading-5 text-navy/45 dark:text-wheat">
              پرداخت در این نسخه هنگامِ تحویل، دربِ خانه انجام می‌شود.
              <br />
              شمارهٔ موبایل فقط برای تماس در صورت نیاز است؛ پشتیبانی فقط از طریق تیکت در سایت.
            </p>
          </DialogContent>
        </Dialog>

        <ul className="mt-5 grid grid-cols-3 gap-2 text-[11px] text-navy/60 dark:text-wheat">
          <li className="rounded-[26px] border border-navy/8 bg-white/94 shadow-[0_18px_40px_-26px_rgba(14,42,71,.28)] transition-all duration-500 hover:border-gold/50 hover:shadow-[0_22px_44px_-22px_rgba(193,147,87,.28)] dark:border-gold/30 dark:bg-slate/60 px-2 py-3 text-center hover:translate-y-0"><Truck className="mx-auto mb-1 size-4 text-gold" /> ارسال ۲–۴ روز</li>
          <li className="rounded-[26px] border border-navy/8 bg-white/94 shadow-[0_18px_40px_-26px_rgba(14,42,71,.28)] transition-all duration-500 hover:border-gold/50 hover:shadow-[0_22px_44px_-22px_rgba(193,147,87,.28)] dark:border-gold/30 dark:bg-slate/60 px-2 py-3 text-center hover:translate-y-0"><RotateCcw className="mx-auto mb-1 size-4 text-gold" /> ۷ روز بازگشت</li>
          <li className="rounded-[26px] border border-navy/8 bg-white/94 shadow-[0_18px_40px_-26px_rgba(14,42,71,.28)] transition-all duration-500 hover:border-gold/50 hover:shadow-[0_22px_44px_-22px_rgba(193,147,87,.28)] dark:border-gold/30 dark:bg-slate/60 px-2 py-3 text-center hover:translate-y-0"><ShieldCheck className="mx-auto mb-1 size-4 text-gold" /> ضدحساسیت</li>
        </ul>
      </div>
    </div>
  );
}
