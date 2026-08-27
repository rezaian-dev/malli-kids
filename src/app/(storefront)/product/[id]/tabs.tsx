"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { useStore } from "@/lib/store";
import { STORAGE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const SIZE_TABLE = [
  ["۸۰", "۷۵–۸۰", "۹–۱۲ ماه", "۴۸"],
  ["۸۶", "۸۱–۸۶", "۱۲–۱۸ ماه", "۵۰"],
  ["۹۲", "۸۷–۹۲", "۱۸–۲۴ ماه", "۵۲"],
  ["۹۸", "۹۳–۹۸", "۲–۳ سال", "۵۴"],
  ["۱۰۴", "۹۹–۱۰۴", "۳–۴ سال", "۵۶"],
  ["۱۱۰", "۱۰۵–۱۱۰", "۴–۵ سال", "۵۸"],
  ["۱۱۶", "۱۱۱–۱۱۶", "۵–۶ سال", "۶۰"],
  ["۱۲۲", "۱۱۷–۱۲۲", "۶–۷ سال", "۶۲"],
];

export function Tabs({ product }: { product: Product }) {
  const { user, showToast } = useStore();
  const [tab, setTab] = useState<"info" | "size" | "rev">("info");
  const [review, setReview] = useState("");

  const [purchased, setPurchased] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE.purchases);
      const list: (number | string)[] = raw ? JSON.parse(raw) : [];
      setPurchased(list.includes(product.id % 8) || list.includes(product.name));
    } catch {
      setPurchased(false);
    }
  }, [product.id, product.name]);

  return (
    <section className="mt-16">
      <div className="mb-6 flex w-max max-w-full gap-1 overflow-x-auto rounded-full border border-navy/5 bg-white p-1.5 dark:border-gold/30 dark:bg-slate">
        {([["info", "معرفی"], ["size", "راهنمای سایز"], ["rev", "نظر خریداران"]] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm ${tab === id ? "bg-navy font-black text-cream" : "font-bold text-navy/50 dark:text-wheat"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "info" ? (
        <div className="max-w-3xl rounded-3xl border border-navy/5 bg-white p-6 text-sm leading-8 text-navy/70 dark:border-gold/30 dark:bg-slate dark:text-wheat">
          <p>{product.desc}</p>
          <p className="mt-3">دوخت ایرانی، پارچه گواهی‌شده و پرو مجازی پیش از خرید.</p>
        </div>
      ) : null}

      {tab === "size" ? (
        <div className="grid items-start gap-5 lg:grid-cols-[1fr_280px]">
          <div className="overflow-x-auto rounded-[28px] border border-navy/8 bg-white dark:border-gold/30 dark:bg-slate">
            <table className="w-full min-w-130 text-right text-sm">
              <thead>
                <tr className="bg-navy text-[11px] text-cream">
                  <th className="p-4 font-black">سایز</th>
                  <th className="p-4 font-bold">قد کودک (سانتی‌متر)</th>
                  <th className="p-4 font-bold">سن تقریبی</th>
                  <th className="p-4 font-bold">دور سینه</th>
                </tr>
              </thead>
              <tbody className="text-navy/75 dark:text-wheat">
                {SIZE_TABLE.map((r, i) => (
                  <tr key={r[0]} className={`border-t border-navy/5 ${r[0] === "۹۸" ? "bg-gold-pale" : i % 2 ? "bg-sand" : "bg-white"}`}>
                    <td className="p-4 font-black text-navy dark:text-ivory">
                      {r[0]}
                      {r[0] === "۹۸" ? <span className="ms-1 text-[10px] font-bold text-gold">پیشنهادی</span> : null}
                    </td>
                    <td className="p-4">{r[1]}</td>
                    <td className="p-4">{r[2]}</td>
                    <td className="p-4">{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <aside className="rounded-[28px] bg-navy p-5 text-cream sm:p-6">
            <p className="text-xs font-bold text-gold-light">چطور اندازه بگیریم؟</p>
            <ul className="mt-4 space-y-3 text-[13px] leading-6 text-cream/75">
              <li>قد را بدون کفش، از فرق سر تا کف پا بگیرید.</li>
              <li>دور سینه را از پهن‌ترین قسمت با متر نرم اندازه بزنید.</li>
              <li>اگر بین دو سایز بودید، سایز بزرگ‌تر را انتخاب کنید.</li>
            </ul>
          </aside>
        </div>
      ) : null}

      {tab === "rev" ? (
        <div className="max-w-3xl space-y-4">
          {user && purchased ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast("نظر ثبت شد (دمو)");
                setReview("");
              }}
              className="space-y-3 rounded-3xl border border-navy/8 bg-white p-5 dark:border-gold/30 dark:bg-slate"
            >
              <p className="font-black text-navy dark:text-ivory">تجربه‌تان از این خرید</p>
              <Textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder="کیفیت دوخت، سایز و بسته‌بندی را بنویسید…" className="min-h-27.5 rounded-2xl border-gold/40" />
              <Button type="submit" variant="navy" className="h-11 px-6">ثبت نظر</Button>
            </form>
          ) : (
            <p className="rounded-3xl border border-dashed border-navy/15 bg-sand px-5 py-4 text-sm text-navy/55 dark:border-gold/30 dark:bg-dusk-alt dark:text-wheat">
              ثبت نظر فقط پس از خرید و ورود ممکن است.
            </p>
          )}
          <article className="rounded-3xl border border-navy/5 bg-white p-5 dark:border-gold/30 dark:bg-slate">
            <div className="flex flex-wrap justify-between gap-3">
              <p className="text-sm font-black text-navy dark:text-ivory">سارا محمدی</p>
              <span className="text-[11px] text-navy/40">تاریخ نظر: ۳ مرداد ۱۴۰۵</span>
            </div>
            <p className="mt-1 text-[11px] text-navy/45">محصول: {product.name}</p>
            <p className="mt-3 text-sm leading-7 text-navy/70 dark:text-wheat">«کیفیت دوخت از عکس بهتر بود و سایز پیشنهادی پرو مجازی دقیق بود.»</p>
          </article>
        </div>
      ) : null}
    </section>
  );
}
