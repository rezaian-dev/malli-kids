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
      <p className="border-navy/12 bg-sand/70 text-navy/55 dark:border-gold/30 dark:bg-dusk-alt dark:text-wheat rounded-3xl border border-dashed px-5 py-5 text-sm">
        هنوز نظری برای این مدل ثبت نشده؛ اولین خریدار باشید ✨
      </p>
    );
  }

  return (
    <>
      {list.map((r) => (
        <article
          key={r.id}
          className="border-navy/8 dark:border-gold/30 dark:bg-slate rounded-3xl border bg-white/90 p-5 shadow-[0_16px_36px_-26px_rgba(14,42,71,.28)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="bg-gold/15 text-gold grid size-9 place-items-center rounded-full text-sm font-black">
                {r.author.trim().charAt(0)}
              </span>
              <p className="text-navy dark:text-ivory text-sm font-black">
                {r.author}
              </p>
            </div>
            <span className="text-navy/40 text-[11px]">
              تاریخ نظر: {r.date}
            </span>
          </div>
          <div
            className="mt-1.5 flex items-center gap-1"
            aria-label={`${r.rate} ستاره`}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`size-3.5 ${i < r.rate ? "fill-gold text-gold" : "text-navy/20 dark:text-wheat/25"}`}
              />
            ))}
          </div>
          <p className="text-navy/70 dark:text-wheat mt-3 text-sm leading-7">
            «{r.text}»
          </p>
        </article>
      ))}
    </>
  );
}
