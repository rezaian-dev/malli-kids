"use client";

import { useMemo, useState } from "react";
import { Baby, Flame, Search as SearchIcon, Shirt, Sparkles, TrendingUp } from "lucide-react";
import { CORE_PRODUCTS, pdpHref } from "@/lib/data/products";
import { formatToman } from "@/lib/format";

const CHIPS = [
  { q: "پیراهن", Icon: Shirt },
  { q: "سیسمونی", Icon: Baby },
  { q: "پالتو", Icon: Flame },
  { q: "دستدوز", Icon: Sparkles },
];

export function Search() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const hits = useMemo(() => {
    const s = q.trim();
    if (!s) return [];
    return CORE_PRODUCTS.filter((p) => p.name.includes(s) || p.cat.includes(s)).slice(0, 5);
  }, [q]);

  function goShop(value?: string) {
    const v = (value ?? q).trim();
    window.location.href = v ? `/shop?q=${encodeURIComponent(v)}` : "/shop";
  }

  return (
    <div className="mt-8 text-right">
      <div className="relative">
        <form
          role="search"
          className="relative z-20 flex items-center gap-1.5 rounded-3xl bg-white p-1.5 shadow-2xl xs:gap-2 xs:p-2 sm:p-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            goShop();
          }}
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-navy">
            <SearchIcon className="size-5" />
          </span>
          <input
            id="homeSearch"
            type="search"
            autoComplete="off"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 180)}
            placeholder="مثلاً پیراهن، سیسمونی، پالتو…"
            className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-navy outline-none placeholder:text-navy/40 sm:text-base"
          />
          <button type="submit" className="shrink-0 rounded-2xl bg-navy px-4 py-3 text-xs font-black text-ivory sm:px-6 sm:text-sm">
            جستجو
          </button>
        </form>

        <div
          className={`absolute inset-x-0 top-full z-30 mt-2 rounded-2xl border border-gold/35 bg-paper shadow-xl dark:border-gold/40 dark:bg-dusk ${
            open ? "visible opacity-100" : "pointer-events-none invisible opacity-0"
          }`}
        >
          {!q.trim() ? (
            <div className="p-4">
              <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold text-navy/50 dark:text-gold-soft">
                <TrendingUp className="size-4 text-gold" /> جستجوهای پرتکرار
              </p>
              <div className="flex flex-wrap gap-2">
                {CHIPS.map(({ q: chip, Icon }) => (
                  <button
                    key={chip}
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3.5 py-2 text-xs font-extrabold text-navy dark:bg-dusk-mid dark:text-linen"
                    onMouseDown={() => {
                      setQ(chip);
                      setOpen(true);
                    }}
                  >
                    <Icon className="size-3.5 text-gold" />
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : hits.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm font-bold text-navy/55 dark:text-wheat">نتیجه‌ای برای «{q.trim()}» نیست</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {hits.map((p) => (
                <li key={p.id}>
                  <a href={pdpHref(p.id)} className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-gold/10">
                    <img src={p.img} alt="" className="h-12 w-10 shrink-0 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1 text-start">
                      <span className="block truncate text-sm font-black text-navy dark:text-ivory">{p.name}</span>
                      <span className="block text-[11px] text-navy/45 dark:text-wheat">{p.cat}</span>
                    </span>
                    <span className="text-xs font-black text-gold">{formatToman(p.price)}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-5 flex flex-wrap items-center justify-center gap-2">
        <span className="text-[11px] font-bold text-ivory/80">پرطرفدار:</span>
        {CHIPS.map(({ q: chip, Icon }) => (
          <button
            key={chip}
            type="button"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold text-ivory hover:bg-gold hover:text-navy-deep"
            onClick={() => {
              setQ(chip);
              setOpen(true);
            }}
          >
            <Icon className="size-3.5" />
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
