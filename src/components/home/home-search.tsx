"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Baby,
  Flame,
  Search as SearchIcon,
  Shirt,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { CORE_PRODUCTS } from "@/lib/data/products";
import { cn } from "@/lib/utils";
import { formatToman } from "@/lib/format";

const CHIPS = [
  { q: "پیراهن", Icon: Shirt },
  { q: "سیسمونی", Icon: Baby },
  { q: "پالتو", Icon: Flame },
  { q: "دستدوز", Icon: Sparkles },
];

const MIN_QUERY = 2;
const MAX_QUERY = 60;
const ERROR_TEXT = "mt-2 text-xs font-bold text-rose-200";

// 🔎 Tiny home search without form-runtime overhead.
export function HomeSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const q = query.trim();

  const hits = useMemo(() => {
    if (!q) return [];
    return CORE_PRODUCTS.filter(
      (p) => p.name.includes(q) || p.cat.includes(q),
    ).slice(0, 5);
  }, [q]);

  function goShop(value: string) {
    const next = value.trim();

    if (next !== "" && next.length < MIN_QUERY) {
      setError("برای جستجو حداقل ۲ حرف بنویسید");
      return;
    }

    setError("");
    router.push(next ? `/shop?q=${encodeURIComponent(next)}` : "/shop");
  }

  function selectSuggestion(value: string) {
    const next = value.trim();
    if (!next) return;

    setQuery(next);
    setError("");
    setOpen(false);
    router.push(`/shop?q=${encodeURIComponent(next)}`);
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
            goShop(query);
          }}
        >
          <div className="border-gold/40 xs:gap-2 xs:p-2 flex items-center gap-1.5 rounded-3xl border bg-white/85 p-1.5 shadow-[0_18px_50px_-18px_rgba(193,147,87,.55)] backdrop-blur-xl sm:p-2.5">
            <span className="from-gold/25 to-gold/10 text-gold-deep ring-gold/30 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ring-1">
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
              className="text-navy placeholder:text-navy/40 min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none sm:text-base"
            />
            <button
              type="submit"
              className="bg-navy text-ivory shrink-0 rounded-2xl px-4 py-3 text-xs font-black sm:px-6 sm:text-sm"
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
          className={`border-gold/35 bg-paper dark:border-gold/40 dark:bg-dusk absolute inset-x-0 top-full z-30 mt-2 rounded-2xl border shadow-xl ${
            open
              ? "visible opacity-100"
              : "pointer-events-none invisible opacity-0"
          }`}
        >
          {!q ? (
            <div className="p-4">
              <p className="text-navy/50 dark:text-gold-soft mb-3 flex items-center gap-1.5 text-[11px] font-bold">
                <TrendingUp className="text-gold size-4" /> جستجوهای پرتکرار
              </p>
              <div className="flex flex-wrap gap-2">
                {CHIPS.map(({ q: chip, Icon }) => (
                  <button
                    key={chip}
                    type="button"
                    className="bg-sand text-navy dark:bg-dusk-mid dark:text-linen inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-extrabold"
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => selectSuggestion(chip)}
                  >
                    <Icon className="text-gold size-3.5" />
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : hits.length === 0 ? (
            <p className="text-navy/55 dark:text-wheat px-5 py-6 text-center text-sm font-bold">
              نتیجه‌ای برای «{q}» نیست
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {hits.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => selectSuggestion(p.name)}
                    className="hover:bg-gold/10 focus-visible:bg-gold/10 flex w-full items-center gap-3 px-3.5 py-2.5 text-start"
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
                      <span className="text-navy/45 dark:text-wheat block text-[11px]">
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

      <div className="relative z-10 mt-5 flex flex-wrap items-center justify-center gap-2">
        <span className="text-ivory/80 text-[11px] font-bold">پرطرفدار:</span>
        {CHIPS.map(({ q: chip, Icon }) => (
          <button
            key={chip}
            type="button"
            className="text-ivory hover:bg-gold hover:text-navy-deep inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold"
            onClick={() => selectSuggestion(chip)}
          >
            <Icon className="size-3.5" />
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
