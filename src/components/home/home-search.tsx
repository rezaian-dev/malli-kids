import Link from "next/link";
import { Baby, Flame, Search as SearchIcon, Shirt, Sparkles, TrendingUp } from "lucide-react";
import { CORE_PRODUCTS } from "@/lib/data/products";

const CHIPS = [
  { q: "پیراهن", Icon: Shirt },
  { q: "سیسمونی", Icon: Baby },
  { q: "پالتو", Icon: Flame },
  { q: "دستدوز", Icon: Sparkles },
];

const SUGGESTIONS = Array.from(
  new Set([
    ...CHIPS.map((item) => item.q),
    ...CORE_PRODUCTS.flatMap((product) => [product.name, product.cat]),
  ]),
).slice(0, 16);

// 🔎 Lightweight home search with native suggestions and zero client JS.
export function HomeSearch() {
  return (
    <div className="mt-8 text-right">
      <form role="search" action="/shop" className="relative z-20">
        <div className="xs:gap-2 xs:p-2 flex items-center gap-1.5 rounded-3xl border border-gold/40 bg-white/85 p-1.5 shadow-[0_18px_50px_-18px_rgba(193,147,87,.55)] backdrop-blur-xl sm:p-2.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-gold/25 to-gold/10 text-gold-deep ring-1 ring-gold/30">
            <SearchIcon className="size-5" />
          </span>
          <input
            id="homeSearch"
            name="q"
            type="search"
            list="home-search-options"
            autoComplete="off"
            minLength={2}
            maxLength={60}
            placeholder="پیراهن، سیسمونی…"
            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-navy outline-none placeholder:text-navy/40 sm:text-base"
            aria-label="جستجوی محصولات"
          />
          <button type="submit" className="shrink-0 rounded-2xl bg-navy px-4 py-3 text-xs font-black text-ivory sm:px-6 sm:text-sm">
            جستجو
          </button>
        </div>
        <datalist id="home-search-options">
          {SUGGESTIONS.map((value) => (
            <option key={value} value={value} />
          ))}
        </datalist>
        <p className="mt-2 text-xs font-bold text-ivory/90">برای جستجو حداقل ۲ حرف بنویسید.</p>
      </form>

      <div className="mt-4 rounded-2xl border border-gold/25 bg-white/10 p-4 backdrop-blur-sm">
        <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold text-ivory/90">
          <TrendingUp className="size-4 text-gold" /> جستجوهای پرتکرار
        </p>
        <div className="flex flex-wrap gap-2">
          {CHIPS.map(({ q, Icon }) => (
            <Link
              key={q}
              href={`/shop?q=${encodeURIComponent(q)}`}
              prefetch={false}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold text-ivory transition-colors hover:bg-gold hover:text-navy-deep"
            >
              <Icon className="size-3.5" />
              {q}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
