"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { loadReviews } from "@/lib/admin-sync";
import type { AdminReview, Product } from "@/types";
import { useLiveProduct } from "./product-live-context";

export function ProductReviews({ product: seed }: { product: Product }) {
  const product = useLiveProduct(seed);
  const [list, setList] = useState<AdminReview[]>([]);
  useEffect(() => {
    setList(loadReviews(true).filter((r) => r.product === product.name));
  }, [product.name]);

  if (list.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-navy/15 bg-sand px-5 py-4 text-sm text-navy/55 dark:border-gold/30 dark:bg-dusk-alt dark:text-wheat">
        هنوز نظری برای این مدل ثبت نشده؛ اولین خریدار باشید ✨
      </p>
    );
  }

  return (
    <>
      {list.map((r) => (
        <article key={r.id} className="rounded-3xl border border-navy/5 bg-white p-5 dark:border-gold/30 dark:bg-slate">
          <div className="flex flex-wrap justify-between gap-3">
            <p className="text-sm font-black text-navy dark:text-ivory">{r.author}</p>
            <span className="text-[11px] text-navy/40">تاریخ نظر: {r.date}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1" aria-label={`${r.rate} ستاره`}>
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className={`size-3.5 ${i < r.rate ? "fill-gold text-gold" : "text-navy/20 dark:text-wheat/25"}`} />
            ))}
          </div>
          <p className="mt-3 text-sm leading-7 text-navy/70 dark:text-wheat">«{r.text}»</p>
        </article>
      ))}
    </>
  );
}
