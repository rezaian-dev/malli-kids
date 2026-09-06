"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, Loader2, Search as SearchIcon, TrendingUp } from "lucide-react";
import { searchProductsPreviewAction } from "@/lib/shop/products-actions";
import { shopHrefFromSearch } from "@/lib/shop-query";
import { recordSearchAction } from "../_lib/search-actions";
import { FIELD_FOCUS_WITHIN } from "@/lib/field";
import { cn } from "@/lib/utils";
import { formatToman } from "@/lib/locale/fa";

const MIN_QUERY = 2;
const MAX_QUERY = 60;
const DEBOUNCE_MS = 250;
const ERROR_TEXT = "mt-2 text-xs font-bold text-rose-200";

type Hit = Awaited<ReturnType<typeof searchProductsPreviewAction>>[number];

// 🔎 Tiny home search without form-runtime overhead.
export function HomeSearch({ popularTerms }: { popularTerms: string[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const q = query.trim();

  // 🔎 Real catalog lookup, debounced so every keystroke doesn't hit the DB.
  useEffect(() => {
    if (q.length < MIN_QUERY) {
      setHits([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(() => {
      searchProductsPreviewAction(q).then((results) => {
        if (!cancelled) {
          setHits(results);
          setLoading(false);
        }
      });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [q]);

  // 🔎 The one real "search happened" moment — never keystrokes
  function runSearch(value: string) {
    const next = value.trim();

    if (next !== "" && next.length < MIN_QUERY) {
      setError("برای جستجو حداقل ۲ حرف بنویسید");
      return;
    }

    setQuery(next);
    setError("");
    setOpen(false);
    router.push(shopHrefFromSearch(next));
    if (next) void recordSearchAction(next);
  }

  return (
    <div className="mt-8 text-right">
      <div className="relative">
        <form
          role="search"
          aria-label="جستجوی محصولات"
          className="relative z-20"
          onSubmit={(event) => {
            event.preventDefault();
            runSearch(query);
          }}
        >
          <div
            className={cn(
              "xs:gap-2 xs:p-2 flex items-center gap-1.5 rounded-3xl border p-1.5 backdrop-blur-xl transition-[border-color,box-shadow] duration-200 sm:p-2.5",
              "border-gold/40 bg-white/85 shadow-[0_18px_50px_-18px_rgba(193,147,87,.55)]",
              FIELD_FOCUS_WITHIN,
            )}
          >
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-2xl ring-1 from-gold/25 to-gold/10 text-gold-deep ring-gold/30 bg-linear-to-br"
            >
              <SearchIcon className="size-5" />
            </span>
            <input
              id="homeSearch"
              type="search"
              autoComplete="off"
              aria-label="جستجوی محصولات"
              aria-invalid={Boolean(error) || undefined}
              aria-describedby={error ? "homeSearch-msg" : undefined}
              maxLength={MAX_QUERY}
              placeholder="پیراهن، سیسمونی…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setError("");
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => window.setTimeout(() => setOpen(false), 180)}
              className="min-w-0 flex-1 px-3 py-3 text-sm outline-none sm:text-base text-navy placeholder:text-navy/70 bg-transparent"
            />
            <button
              type="submit"
              className="shrink-0 rounded-2xl px-4 py-3 text-xs font-black transition-all duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md motion-safe:active:translate-y-0 motion-safe:active:scale-95 sm:px-6 sm:text-sm bg-navy text-ivory hover:bg-navy-mid"
            >
              جستجو
            </button>
          </div>
          {error ? (
            <p
              id="homeSearch-msg"
              role="alert"
              className={cn(ERROR_TEXT, "text-ivory/90 dark:text-ivory")}
            >
              {error}
            </p>
          ) : null}
        </form>

        <div
          className={cn(
            "absolute inset-x-0 top-full z-30 mt-2 rounded-2xl border shadow-xl",
            "border-gold/35 bg-paper",
            open
              ? "visible opacity-100"
              : "pointer-events-none invisible opacity-0",
            "dark:border-gold/40 dark:bg-dusk",
          )}
        >
          {!q ? (
            <div className="p-4">
              <p className="text-navy/70 dark:text-gold-soft mb-3 flex items-center gap-1.5 text-[11px] font-bold">
                <TrendingUp className="text-gold size-4" /> جستجوهای پرتکرار
              </p>
              <div className="flex flex-wrap gap-2">
                {popularTerms.map((term) => (
                  <button
                    key={term}
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-extrabold transition-all duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-95 bg-sand text-navy hover:bg-gold/25 dark:bg-dusk-mid dark:text-linen dark:hover:bg-dusk"
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => runSearch(term)}
                  >
                    <Flame className="text-gold size-3.5" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : loading ? (
            <p className="text-navy/70 dark:text-wheat flex items-center justify-center gap-2 px-5 py-6 text-center text-sm font-bold">
              <Loader2 className="size-4 animate-spin" /> در حال جستجو…
            </p>
          ) : hits.length === 0 ? (
            <p className="text-navy/70 dark:text-wheat px-5 py-6 text-center text-sm font-bold">
              نتیجه‌ای برای «{q}» نیست
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {hits.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => runSearch(p.name)}
                    className="flex w-full items-center gap-3 px-3.5 py-2.5 text-start transition-colors duration-150 hover:bg-gold/10 focus-visible:bg-gold/10"
                  >
                    <Image
                      src={p.img}
                      alt=""
                      width={40}
                      height={48}
                      sizes="40px"
                      className="h-12 w-10 shrink-0 rounded-lg object-cover"
                    />
                    <span className="min-w-0 flex-1 text-start">
                      <span className="text-navy dark:text-ivory block truncate text-sm font-black">
                        {p.name}
                      </span>
                      <span className="text-navy/70 dark:text-wheat block text-[11px]">
                        {p.cat}
                      </span>
                    </span>
                    <span className="text-gold text-xs font-black">
                      {formatToman(p.price)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {popularTerms.length ? (
        <div className="relative z-10 mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-ivory/80 text-[11px] font-bold">پرطرفدار:</span>
          {popularTerms.map((term) => (
            <button
              key={term}
              type="button"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-ivory hover:bg-gold hover:text-navy-deep bg-white/20"
              onClick={() => runSearch(term)}
            >
              <Flame className="size-3.5" />
              {term}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
