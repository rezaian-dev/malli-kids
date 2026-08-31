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
      <p className="border-navy/12 bg-sand/70 text-navy/55 dark:border-gold/30 dark:bg-dusk-alt dark:text-wheat rounded-2xl border border-dashed px-4 py-4 text-sm leading-7 sm:rounded-3xl sm:px-5 sm:py-5">
        هنوز نظری برای این مدل ثبت نشده؛ اولین خریدار باشید ✨
      </p>
    );
  }

  return (
    <>
      {list.map((r) => (
        <article
          key={r.id}
          className="border-navy/8 dark:border-gold/30 dark:bg-slate min-w-0 rounded-3xl border bg-white/90 p-4 shadow-[0_16px_36px_-26px_rgba(14,42,71,.28)] sm:p-5"
        >
          <div className="flex flex-col gap-2 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="bg-gold/15 text-gold grid size-9 shrink-0 place-items-center rounded-full text-sm font-black">
                {r.author.trim().charAt(0)}
              </span>
              <p className="text-navy dark:text-ivory truncate text-sm font-black">
                {r.author}
              </p>
            </div>
            <time className="text-navy/55 dark:text-wheat shrink-0 text-[11px] font-bold no-underline">
              تاریخ نظر: {r.date}
            </time>
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
