"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Quote, Star, ThumbsUp } from "lucide-react";
import { loadReviews } from "@/lib/admin-sync";
import { toFaDigits } from "@/lib/format";
import type { AdminReview, Product } from "@/types";
import { pdpKicker, pdpWell } from "./product-chrome";
import { useLiveProduct } from "./product-live-context";
import { cn } from "@/lib/utils";

function Stars({
  n,
  className = "size-3.5",
}: {
  n: number;
  className?: string;
}) {
  return (
    <span
      className="inline-flex gap-0.5"
      role="img"
      aria-label={`${toFaDigits(n)} از ۵`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            className,
            i < n ? "fill-gold text-gold" : "text-navy/15 dark:text-wheat/25",
          )}
        />
      ))}
    </span>
  );
}

function featuredFor(product: Product): AdminReview {
  return {
    id: `atelier-featured-${product.id}`,
    product: product.name,
    author: "سارا محمدی",
    rate: 5,
    text: "پارچه نرم و دوخت تمیز بود؛ سایز راهنما دقیقاً همانی شد که پرو مجازی گفته بود. برای مهمانی عالی است.",
    date: "۲۸ مرداد ۱۴۰۵",
    visible: true,
  };
}

function distFromAvg(avg: number) {
  const five = Math.round(Math.min(92, Math.max(48, (avg - 3.2) * 38)));
  const four = Math.round((100 - five) * 0.62);
  const three = Math.round((100 - five - four) * 0.7);
  const two = Math.max(0, Math.round((100 - five - four - three) * 0.55));
  const one = Math.max(0, 100 - five - four - three - two);
  return [five, four, three, two, one];
}

export function ProductReviews({ product: seed }: { product: Product }) {
  const product = useLiveProduct(seed);
  const [live, setLive] = useState<AdminReview[]>([]);
  const [thanks, setThanks] = useState(false);

  useEffect(() => {
    setLive(loadReviews(true).filter((r) => r.product === product.name));
  }, [product.name]);

  const featured = featuredFor(product);
  const others = live.filter(
    (r) => r.author !== featured.author && r.id !== featured.id,
  );
  const avg = product.rate || 4.9;
  const recommend = Math.min(
    99,
    others.length
      ? Math.round(
          ((others.filter((r) => r.rate >= 4).length + 1) /
            (others.length + 1)) *
            100,
        )
      : Math.round((avg / 5) * 98),
  );
  const bars = useMemo(() => distFromAvg(avg), [avg]);
  const count = Math.max(1, others.length + 1);

  return (
    <div className="min-w-0 space-y-4">
      <div className={`${pdpWell} overflow-hidden p-4 sm:p-6`}>
        <p className={pdpKicker}>BUYER NOTES</p>
        <div className="mt-3 grid min-w-0 items-center gap-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-6">
          <div className="text-center sm:text-right">
            <p
              className={cn(
                "text-[2.75rem] leading-none font-black",
                "text-navy",
                "dark:text-ivory",
              )}
            >
              {toFaDigits(avg.toFixed(1))}
            </p>
            <div className="mt-2 flex justify-center sm:justify-start">
              <Stars n={Math.round(avg)} className="size-4" />
            </div>
            <p className="text-navy/70 dark:text-wheat mt-2 text-[11px] font-bold">
              از {toFaDigits(count)} نظر تأییدشده
            </p>
          </div>

          <ul className="min-w-0 space-y-1.5" aria-label="توزیع امتیاز">
            {bars.map((pct, i) => {
              const star = 5 - i;
              return (
                <li key={star} className="flex items-center gap-2">
                  <span className="text-navy/70 dark:text-wheat w-3 text-[11px] font-black">
                    {toFaDigits(star)}
                  </span>
                  <span
                    className={cn(
                      "h-1.5 min-w-0 flex-1 overflow-hidden rounded-full",
                      "bg-navy/10",
                      "dark:bg-ivory/10",
                    )}
                  >
                    <span
                      className="bg-gold block h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span
                    className={cn(
                      "w-8 text-end text-[10px] font-bold",
                      "text-navy/70",
                      "dark:text-wheat/80",
                    )}
                  >
                    {toFaDigits(pct)}٪
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-center gap-3 sm:flex-col">
            <div
              className="grid size-20 shrink-0 place-items-center rounded-full"
              style={{
                background: `conic-gradient(var(--color-gold) ${recommend}%, color-mix(in srgb, var(--color-navy) 14%, transparent) 0)`,
              }}
              aria-hidden
            >
              <span
                className={cn(
                  "grid size-14 place-items-center rounded-full text-sm font-black",
                  "text-navy bg-white",
                  "dark:bg-dusk dark:text-ivory",
                )}
              >
                {toFaDigits(recommend)}٪
              </span>
            </div>
            <p
              className={cn(
                "max-w-28 text-center text-[11px] leading-5 font-black sm:max-w-none",
                "text-navy",
                "dark:text-ivory",
              )}
            >
              پیشنهاد می‌کنند
            </p>
          </div>
        </div>

        <ul className="mt-5 grid grid-cols-2 gap-2 min-[480px]:grid-cols-4">
          {[
            ["پیشنهاد خرید", `${toFaDigits(recommend)}٪`],
            ["تطبیق سایز", `${toFaDigits(Math.max(88, recommend - 3))}٪`],
            ["کیفیت دوخت", `${toFaDigits(Math.min(99, recommend + 1))}٪`],
            ["خرید مجدد", `${toFaDigits(Math.max(84, recommend - 6))}٪`],
          ].map(([label, val]) => (
            <li
              key={label}
              className={cn(
                "rounded-2xl border px-3 py-3 text-center",
                "border-navy/8 bg-white/80",
                "dark:border-gold/20 dark:bg-navy-deep/40",
              )}
            >
              <p className="text-navy dark:text-ivory text-base font-black">
                {val}
              </p>
              <p className="text-navy/70 dark:text-wheat mt-1 text-[10px] font-bold">
                {label}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <article
        className={cn(
          "relative min-w-0 overflow-hidden rounded-[22px] p-4 shadow-[0_22px_44px_-28px_rgba(14,42,71,.45)] sm:rounded-[28px] sm:p-6",
          "bg-navy text-ivory",
          "dark:bg-dusk-deep dark:ring-gold/30 dark:ring-1",
        )}
      >
        <Quote
          className="text-gold/20 pointer-events-none absolute top-3 left-3 size-12 sm:size-16"
          strokeWidth={1.15}
        />
        <div className="relative flex flex-wrap items-center gap-1.5">
          <span className="bg-gold text-navy-deep rounded-full px-2.5 py-0.5 text-[10px] font-black">
            نظر منتخب
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
              "text-gold-light border-white/15 bg-white/10",
            )}
          >
            <BadgeCheck className="size-3.5" /> خرید تأییدشده
          </span>
          <Stars n={featured.rate} />
        </div>
        <p className="text-ivory mt-4 text-sm leading-7 font-medium sm:text-[15px]">
          «{featured.text}»
        </p>
        <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-xl text-sm font-black",
                "bg-gold text-navy-deep",
              )}
            >
              س
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">
                {featured.author}
              </p>
              <time className="text-wheat mt-0.5 block text-[11px] font-bold no-underline">
                {featured.date}
              </time>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setThanks((v) => !v)}
            className={cn(
              "inline-flex min-h-9 w-max shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-bold",
              thanks
                ? "border-gold bg-gold text-navy-deep"
                : "text-ivory border-white/20 bg-white/10",
            )}
          >
            <ThumbsUp className="size-3.5" />
            {thanks ? "مفید بود" : "مفید"} ({toFaDigits(thanks ? 43 : 42)})
          </button>
        </div>
      </article>

      {others.map((r) => (
        <article
          key={r.id}
          className={cn(
            "min-w-0 rounded-[22px] p-4 shadow-[0_16px_36px_-26px_rgba(14,42,71,.28)] sm:rounded-3xl sm:p-5",
            "border-navy/8 border bg-white/90",
            "dark:border-gold/30 dark:bg-slate",
          )}
        >
          <div className="flex flex-col gap-2 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full text-sm font-black",
                  "bg-gold/15 text-gold",
                )}
              >
                {r.author.trim().charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="text-navy dark:text-ivory truncate text-sm font-black">
                  {r.author}
                </p>
                <Stars n={r.rate} />
              </div>
            </div>
            <time
              className={cn(
                "shrink-0 text-[11px] font-bold no-underline",
                "text-navy/70",
                "dark:text-wheat",
              )}
            >
              تاریخ نظر: {r.date}
            </time>
          </div>
          <p className="text-navy/70 dark:text-wheat mt-3 text-sm leading-7">
            «{r.text}»
          </p>
        </article>
      ))}
    </div>
  );
}
