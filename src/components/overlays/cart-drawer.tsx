"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Gift, Minus, Plus, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { BRAND } from "@/lib/constants";
import { formatToman, toFaDigits } from "@/lib/format";

export function Drawer() {
  const { cart, cartOpen, setCartOpen, setQty, removeFromCart, showToast } = useStore();
  const [code, setCode] = useState("");
  const [off, setOff] = useState(0);

  const sub = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const discount = Math.round(sub * off);
  const ship = sub >= BRAND.freeShipFrom || sub === 0 ? 0 : 85000;
  const total = Math.max(0, sub - discount + ship);
  const qty = cart.reduce((s, i) => s + i.qty, 0);
  const shipLeft = Math.max(0, BRAND.freeShipFrom - sub);
  const shipPct = Math.min(100, Math.round((sub / BRAND.freeShipFrom) * 100));

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCartOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [cartOpen, setCartOpen]);

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-[85]">
      <button type="button" className="animate-overlay-in absolute inset-0 z-0 bg-navy-deep/50" aria-label="بستن سبد" onClick={() => setCartOpen(false)} />
      <aside className="animate-drawer-in absolute inset-y-0 right-0 z-10 flex h-dvh w-[min(100vw,24rem)] flex-col border-s border-gold/20 bg-paper shadow-[-24px_0_60px_-28px_rgba(4,20,39,.45)] dark:bg-dusk dark:text-ivory">
        <header className="shrink-0 bg-linear-to-l from-navy to-navy-mid px-5 py-4 text-ivory">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-gold text-navy-deep">
              <ShoppingBag className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-black">سبد خرید</p>
              <p className="text-[11px] font-bold text-gold-glow">{qty ? `${toFaDigits(qty)} قلم` : "خالی است"}</p>
            </div>
            <button type="button" onClick={() => setCartOpen(false)} className="inline-flex size-9 items-center justify-center rounded-full bg-white/10" aria-label="بستن">
              <X className="size-5" />
            </button>
          </div>
          {cart.length > 0 ? (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5">
              <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold">
                <span className="inline-flex items-center gap-1 text-gold-glow">
                  <Truck className="size-3.5" /> ارسال رایگان از ۱٬۵۰۰٬۰۰۰
                </span>
                <span>{shipLeft === 0 ? "فعال شد" : `${formatToman(shipLeft)} مانده`}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-gold" style={{ width: `${shipPct}%` }} />
              </div>
            </div>
          ) : null}
        </header>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <ShoppingBag className="size-14 text-gold" />
            <p className="font-black">سبد خالی است</p>
            <Link href="/shop" onClick={() => setCartOpen(false)} className="inline-flex h-11 items-center gap-2 rounded-full bg-navy px-6 font-black text-ivory dark:bg-gold dark:text-navy-deep">
              مشاهده کالکشن <ArrowLeft className="size-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {cart.map((i) => (
                <article key={`${i.id}-${i.size}`} className="flex gap-3 rounded-2xl border border-navy/10 bg-white p-3 dark:border-gold/25 dark:bg-dusk-mid">
                  <img src={i.img} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">{i.name}</p>
                    {i.size ? <p className="mt-0.5 text-[11px] text-navy/50 dark:text-wheat">سایز {i.size}</p> : null}
                    <p className="mt-1 text-xs font-black text-gold">{formatToman(i.price)} تومان</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="inline-flex items-center rounded-full border border-navy/10 dark:border-gold/30">
                        <button type="button" className="grid size-8 place-items-center" onClick={() => setQty(i.id, i.qty - 1)} aria-label="کم">
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-black">{toFaDigits(i.qty)}</span>
                        <button type="button" className="grid size-8 place-items-center" onClick={() => setQty(i.id, i.qty + 1)} aria-label="زیاد">
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <button type="button" className="ms-auto text-[11px] font-bold text-rose" onClick={() => removeFromCart(i.id)}>
                        <Trash2 className="inline size-3.5" /> حذف
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <footer className="shrink-0 space-y-2.5 border-t border-navy/10 p-4 dark:border-gold/25">
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Gift className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-gold" />
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="کد MALLI10" className="h-11 w-full rounded-full border border-navy/10 bg-white ps-9 pe-3 text-sm dark:border-gold/30 dark:bg-dusk-mid dark:text-ivory" />
                </div>
                <button
                  type="button"
                  className="h-11 rounded-full bg-navy px-4 text-sm font-black text-ivory dark:bg-gold dark:text-navy-deep"
                  onClick={() => {
                    if (code.trim().toUpperCase() === BRAND.coupon) {
                      setOff(BRAND.couponRate);
                      showToast("۱۰٪ تخفیف اعمال شد");
                    } else showToast("کد نامعتبر است");
                  }}
                >
                  اعمال
                </button>
              </div>
              <div className="flex justify-between text-sm font-bold text-navy/65 dark:text-wheat">
                <span>جمع جزء</span>
                <span>{formatToman(sub)} تومان</span>
              </div>
              {discount > 0 ? (
                <div className="flex justify-between text-sm font-bold text-rose">
                  <span>تخفیف</span>
                  <span>− {formatToman(discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-sm font-bold text-navy/65 dark:text-wheat">
                <span>ارسال</span>
                <span>{ship === 0 ? "رایگان" : `${formatToman(ship)} تومان`}</span>
              </div>
              <div className="flex justify-between rounded-2xl bg-sand px-3 py-2.5 text-sm font-black dark:bg-night-deep">
                <span>قابل پرداخت</span>
                <span className="text-gold">{formatToman(total)} تومان</span>
              </div>
              <button type="button" className="flex h-12 w-full items-center justify-center rounded-full bg-navy font-black text-ivory dark:bg-gold dark:text-navy-deep" onClick={() => showToast("پرداخت دمو است")}>
                تسویه حساب
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
