"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownNarrowWide,
  ArrowUpDown,
  ArrowUpNarrowWide,
  Check,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import { ProductCard } from "@/components/product";
import { loadCatalog } from "@/lib/admin-sync";
import { CATALOG, SEASONS } from "@/lib/data/products";
import { CATS, PER_PAGE, PRICE_CAP, SORTS } from "@/lib/constants";
import { formatToman, toFaDigits } from "@/lib/format";
import { toShopHref, type ShopState } from "../_lib/shop-state";

const PRICE_PRESETS = [
  { label: "هر قیمتی", hint: "بدون محدودیت", min: 0, max: PRICE_CAP },
  { label: "اقتصادی", hint: "تا ۵۰۰ هزار", min: 0, max: 500_000 },
  { label: "متوسط", hint: "۵۰۰ هزار تا ۱ م", min: 500_000, max: 1_000_000 },
  { label: "بالا", hint: "۱ تا ۲ میلیون", min: 1_000_000, max: 2_000_000 },
  { label: "لوکس", hint: "بالای ۲ میلیون", min: 2_000_000, max: PRICE_CAP },
] as const;

const SORT_META = [
  { key: "new", label: "جدیدترین", hint: "تازه‌ترین دوخت‌ها", Icon: Sparkles },
  {
    key: "price-asc",
    label: "ارزان‌ترین",
    hint: "از کم به زیاد",
    Icon: ArrowDownNarrowWide,
  },
  {
    key: "price-desc",
    label: "گران‌ترین",
    hint: "از زیاد به کم",
    Icon: ArrowUpNarrowWide,
  },
  { key: "rate", label: "بیشترین امتیاز", hint: "محبوب مادران", Icon: Star },
] as const;

const STATUS = [
  { name: "stock", label: "فقط موجود", hint: "کالاهای آمادهٔ ارسال" },
  { name: "disc", label: "تخفیف‌دار", hint: "دارای قیمت ویژه" },
  { name: "hot", label: "پرفروش", hint: "منتخب مادران" },
  { name: "new", label: "جدید", hint: "تازه به گالری رسیده" },
] as const;

function SectionLabel({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-[11px] font-black tracking-[0.16em] text-gold uppercase">
      {icon}
      {children}
    </p>
  );
}

function FilterOption({
  title,
  hint,
  active,
}: {
  title: string;
  hint?: string;
  active?: boolean;
}) {
  return (
    <span
      className={[
        "block rounded-2xl border px-3.5 py-2.5 text-right transition-colors",
        active
          ? "border-gold bg-gold-pale/70 dark:border-gold dark:bg-navy-mid"
          : "border-navy/8 bg-white hover:border-gold/40 dark:border-gold/20 dark:bg-navy-mid/60",
      ].join(" ")}
    >
      <span className="block text-[13px] font-extrabold text-navy dark:text-ivory">
        {title}
      </span>
      {hint ? (
        <span className="mt-0.5 block text-[10.5px] font-bold text-navy/45 dark:text-wheat">
          {hint}
        </span>
      ) : null}
    </span>
  );
}

function ToggleChip({
  title,
  active,
}: {
  title: string;
  active: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex min-h-10 items-center rounded-full border px-3.5 py-1.5 text-[12px] font-black transition-colors",
        active
          ? "border-transparent bg-navy text-ivory shadow-[0_8px_18px_-10px_rgba(14,42,71,.55)] dark:bg-gold dark:text-navy-deep"
          : "border-navy/12 bg-white text-navy/70 hover:border-gold/50 hover:text-navy dark:border-gold/25 dark:bg-navy-mid dark:text-wheat",
      ].join(" ")}
    >
      {title}
    </span>
  );
}

function FilterForm({
  state,
  className = "",
  title,
}: {
  state: ShopState;
  className?: string;
  title?: string;
}) {
  return (
    <form action="/shop" method="get" className={className}>
      <input type="hidden" name="sort" value={state.sort} />
      {state.view === "list" ? <input type="hidden" name="view" value="list" /> : null}

      <div className="space-y-6">
        <div className="space-y-2.5">
          <SectionLabel icon={<Search className="size-3.5" />}>جستجو</SectionLabel>
          <label className="relative block">
            <Search className="pointer-events-none absolute inset-e-3.5 top-1/2 size-4 -translate-y-1/2 text-gold" />
            <input
              type="search"
              name="q"
              defaultValue={state.q}
              minLength={2}
              maxLength={60}
              inputMode="search"
              autoComplete="off"
              placeholder="پیراهن، سیسمونی…"
              className="h-12 w-full rounded-2xl border border-navy/12 bg-white ps-4 pe-11 text-sm font-bold text-navy shadow-inner outline-none placeholder:text-navy/35 dark:border-gold/30 dark:bg-navy-mid dark:text-ivory dark:placeholder:text-wheat"
            />
          </label>
        </div>

        <div className="space-y-2.5">
          <SectionLabel icon={<Tag className="size-3.5" />}>دسته‌بندی</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {CATS.map((category) => (
              <label key={category} className="cursor-pointer">
                <input
                  type="radio"
                  name="cat"
                  value={category}
                  defaultChecked={state.cat === category}
                  className="sr-only"
                />
                <ToggleChip title={category} active={state.cat === category} />
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <SectionLabel icon={<Tag className="size-3.5" />}>فصل</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {["همه", ...SEASONS].map((season) => (
              <label key={season} className="cursor-pointer">
                <input
                  type="radio"
                  name="season"
                  value={season}
                  defaultChecked={state.season === season}
                  className="sr-only"
                />
                <ToggleChip title={season} active={state.season === season} />
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <SectionLabel>وضعیت کالا</SectionLabel>
          <div className="space-y-2">
            {STATUS.map((item) => {
              const checked =
                item.name === "stock"
                  ? state.stock
                  : item.name === "disc"
                    ? state.disc
                    : item.name === "hot"
                      ? state.hot
                      : state.onlyNew;

              return (
                <label key={item.name} className="block cursor-pointer">
                  <input
                    type="checkbox"
                    name={item.name}
                    value="1"
                    defaultChecked={checked}
                    className="sr-only"
                  />
                  <FilterOption title={item.label} hint={item.hint} active={checked} />
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <SectionLabel>بازه قیمت</SectionLabel>
          <div className="rounded-2xl border border-navy/8 bg-white p-4 dark:border-gold/20 dark:bg-navy-mid/60">
            <div className="grid gap-2 sm:grid-cols-2">
              <label>
                <span className="mb-1.5 block text-[11px] font-black text-navy/50 dark:text-wheat">
                  از
                </span>
                <input
                  type="number"
                  name="min"
                  min={0}
                  max={PRICE_CAP}
                  step={50000}
                  defaultValue={state.min || ""}
                  placeholder="۰"
                  className="h-11 w-full rounded-xl border border-navy/12 bg-sand px-3 text-sm font-bold text-navy outline-none dark:border-gold/25 dark:bg-dusk-soft dark:text-ivory"
                />
              </label>
              <label>
                <span className="mb-1.5 block text-[11px] font-black text-navy/50 dark:text-wheat">
                  تا
                </span>
                <input
                  type="number"
                  name="max"
                  min={0}
                  max={PRICE_CAP}
                  step={50000}
                  defaultValue={state.max !== PRICE_CAP ? state.max : ""}
                  placeholder={String(PRICE_CAP)}
                  className="h-11 w-full rounded-xl border border-navy/12 bg-sand px-3 text-sm font-bold text-navy outline-none dark:border-gold/25 dark:bg-dusk-soft dark:text-ivory"
                />
              </label>
            </div>
            <p className="mt-2 text-[10px] font-bold text-navy/40 dark:text-wheat/70">
              اگر خالی بگذارید، محدودیت قیمت اعمال نمی‌شود.
            </p>
          </div>

          <div className="grid gap-1.5 sm:grid-cols-2">
            {PRICE_PRESETS.map((preset) => (
              <Link
                key={preset.label}
                href={toShopHref({
                  ...state,
                  min: preset.min,
                  max: preset.max,
                  page: 1,
                })}
                prefetch={false}
                className={[
                  "block rounded-2xl border px-3 py-2.5 text-right transition-colors",
                  preset.min === state.min && preset.max === state.max
                    ? "border-gold bg-navy text-ivory dark:bg-gold dark:text-navy-deep"
                    : "border-navy/8 bg-white text-navy hover:border-gold/45 dark:border-gold/20 dark:bg-navy-mid dark:text-ivory",
                  preset.label === "هر قیمتی" ? "sm:col-span-2" : "",
                ].join(" ")}
              >
                <span className="block text-[12px] font-black">{preset.label}</span>
                <span className="mt-0.5 block text-[10px] font-bold opacity-60">
                  {preset.hint}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row lg:flex-col">
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-navy px-4 text-sm font-black text-ivory transition-colors hover:bg-navy-mid dark:bg-gold dark:text-navy-deep dark:hover:bg-gold-light"
        >
          {title || "اعمال فیلتر"}
        </button>
        <Link
          href={toShopHref({
            ...state,
            cat: "همه",
            season: "همه",
            page: 1,
            sort: "new",
            view: "grid",
            stock: false,
            disc: false,
            hot: false,
            onlyNew: false,
            q: "",
            min: 0,
            max: PRICE_CAP,
          })}
          prefetch={false}
          className="inline-flex h-12 items-center justify-center rounded-2xl border border-gold/45 px-4 text-sm font-black text-gold transition-colors hover:bg-gold/10"
        >
          پاک کردن فیلترها
        </Link>
      </div>
    </form>
  );
}

// 🛍️ Lightweight shop explorer with URL-driven filters.
export function ShopExplorer({ state }: { state: ShopState }) {
  const [catalog, setCatalog] = useState(CATALOG);

  useEffect(() => {
    setCatalog(loadCatalog());
  }, []);

  const filtered = useMemo(() => {
    const next = catalog.filter((product) => {
      if (state.cat !== "همه" && product.cat !== state.cat) return false;
      if (state.season !== "همه" && product.season !== state.season) return false;
      if (state.q && !product.name.includes(state.q) && !product.cat.includes(state.q)) {
        return false;
      }
      if (state.stock && !product.stock) return false;
      if (state.disc && !product.disc) return false;
      if (state.hot && product.badge !== "پرفروش") return false;
      if (state.onlyNew && product.badge !== "جدید") return false;
      return product.price >= state.min && product.price <= state.max;
    });

    if (state.sort === "price-asc") next.sort((a, b) => a.price - b.price);
    else if (state.sort === "price-desc") next.sort((a, b) => b.price - a.price);
    else if (state.sort === "rate") next.sort((a, b) => b.rate - a.rate);

    return next;
  }, [catalog, state]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const page = Math.min(state.page, pages);
  const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const sortLabel = SORTS[state.sort] || "جدیدترین";

  const activeChips = [
    state.cat !== "همه" && {
      label: state.cat,
      href: toShopHref({ ...state, cat: "همه", page: 1 }),
    },
    state.season !== "همه" && {
      label: state.season,
      href: toShopHref({ ...state, season: "همه", page: 1 }),
    },
    !!state.q && {
      label: `«${state.q}»`,
      href: toShopHref({ ...state, q: "", page: 1 }),
    },
    state.stock && {
      label: "فقط موجود",
      href: toShopHref({ ...state, stock: false, page: 1 }),
    },
    state.disc && {
      label: "تخفیف‌دار",
      href: toShopHref({ ...state, disc: false, page: 1 }),
    },
    state.hot && {
      label: "پرفروش",
      href: toShopHref({ ...state, hot: false, page: 1 }),
    },
    state.onlyNew && {
      label: "جدید",
      href: toShopHref({ ...state, onlyNew: false, page: 1 }),
    },
    (state.min > 0 || state.max !== PRICE_CAP) && {
      label: `${formatToman(state.min)} تا ${formatToman(state.max)}`,
      href: toShopHref({ ...state, min: 0, max: PRICE_CAP, page: 1 }),
    },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div className="shop-page container mx-auto w-full px-4 sm:px-5 lg:px-7">
      <p className="mb-5 text-xs font-bold text-navy/45 dark:text-wheat">
        خانه <span className="mx-1.5 text-gold">/</span> فروشگاه
        {state.cat !== "همه" ? (
          <>
            <span className="mx-1.5 text-gold">/</span>
            {state.cat}
          </>
        ) : null}
      </p>

      <div className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-7">
        <aside className="sticky top-30 hidden overflow-hidden rounded-[28px] border border-navy/10 bg-sand-deep/60 shadow-[0_20px_44px_-28px_rgba(14,42,71,.4)] backdrop-blur-sm dark:border-gold/40 dark:bg-filter-night lg:block">
          <div className="flex items-center justify-between gap-3 border-b border-navy/8 bg-white/70 px-4 py-4 dark:border-gold/20 dark:bg-navy-dark/60">
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-2xl bg-navy text-gold shadow-[0_10px_22px_-12px_rgba(14,42,71,.7)] dark:bg-gold dark:text-navy-deep">
                <SlidersHorizontal className="size-4" />
              </span>
              <div>
                <p className="text-sm font-black text-navy dark:text-ivory">
                  فیلتر محصولات
                </p>
                <p className="mt-0.5 text-[10px] font-bold text-navy/45 dark:text-gold-soft">
                  {activeChips.length ? `${toFaDigits(activeChips.length)} مورد فعال` : "بدون فیلتر"}
                </p>
              </div>
            </div>
          </div>
          <FilterForm state={state} className="p-4" title="نمایش کالاها" />
        </aside>

        <section className="min-w-0 rounded-[28px] border border-navy/10 bg-white/85 p-3 shadow-[0_22px_54px_-30px_rgba(14,42,71,.32)] backdrop-blur-sm dark:border-gold/35 dark:bg-slate/45 dark:text-ivory sm:p-5">
          <div className="mb-4 border-b border-navy/6 pb-4 dark:border-gold/15">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-lg font-black text-navy dark:text-ivory sm:text-xl">
                  کالکشن پوشاک کودک
                </h1>
                <p className="mt-1 text-xs text-navy/45 dark:text-wheat">
                  {toFaDigits(filtered.length)} مدل در کالکشن
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <details className="w-full lg:hidden">
                  <summary className="inline-flex h-10 cursor-pointer list-none items-center gap-2 rounded-full bg-navy px-4 text-sm font-black text-ivory marker:hidden">
                    <SlidersHorizontal className="size-4" />
                    فیلتر
                    {activeChips.length ? (
                      <span className="grid size-5 place-items-center rounded-full bg-gold text-[10px] text-navy-deep">
                        {toFaDigits(activeChips.length)}
                      </span>
                    ) : null}
                  </summary>
                  <div className="mt-3 rounded-3xl border border-navy/10 bg-sand-deep/70 p-4 dark:border-gold/25 dark:bg-filter-night">
                    <FilterForm state={state} title="اعمال فیلتر" />
                  </div>
                </details>

                <details className="group min-w-0 flex-1 lg:min-w-44 lg:flex-none">
                  <summary className="flex h-10 cursor-pointer list-none items-center justify-between rounded-full border border-navy/12 bg-sand px-4 text-xs font-black text-navy marker:hidden dark:border-gold/40 dark:bg-dusk-mid dark:text-linen">
                    <span className="flex min-w-0 items-center gap-1.5 truncate">
                      <ArrowUpDown className="size-4 text-gold-soft" />
                      {sortLabel}
                    </span>
                  </summary>
                  <div className="mt-3 min-w-70 rounded-3xl border border-navy/12 bg-linen p-3 shadow-xl dark:border-gold/40 dark:bg-sort-sheet">
                    <p className="px-2 pb-2 text-[11px] font-black tracking-[0.14em] text-gold uppercase">
                      مرتب‌سازی
                    </p>
                    <div className="grid gap-1.5">
                      {SORT_META.map((item) => (
                        <Link
                          key={item.key}
                          href={toShopHref({ ...state, sort: item.key, page: 1 })}
                          prefetch={false}
                          className={[
                            "group flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-right transition-colors",
                            state.sort === item.key
                              ? "border-gold bg-navy text-ivory dark:bg-gold dark:text-navy-deep"
                              : "border-transparent bg-cream text-navy hover:border-gold/40 hover:bg-sand dark:bg-navy-mid dark:text-ivory dark:hover:bg-slate",
                          ].join(" ")}
                        >
                          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sand text-navy dark:bg-dusk-soft dark:text-gold-light">
                            <item.Icon className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-black">{item.label}</span>
                            <span className="mt-0.5 block text-[11px] font-bold opacity-60">
                              {item.hint}
                            </span>
                          </span>
                          {state.sort === item.key ? <Check className="size-4 shrink-0" /> : null}
                        </Link>
                      ))}
                    </div>
                  </div>
                </details>

                <div className="inline-flex rounded-full border border-navy/10 bg-sand p-0.5 dark:border-gold/30 dark:bg-dusk-mid">
                  <Link
                    href={toShopHref({ ...state, view: "grid" })}
                    prefetch={false}
                    aria-label="نمای شبکه"
                    className={[
                      "grid size-9 place-items-center rounded-full text-navy/50 dark:text-wheat",
                      state.view === "grid"
                        ? "bg-navy text-ivory dark:bg-gold dark:text-navy-deep"
                        : "",
                    ].join(" ")}
                  >
                    <LayoutGrid className="size-4" />
                  </Link>
                  <Link
                    href={toShopHref({ ...state, view: "list" })}
                    prefetch={false}
                    aria-label="نمای فهرست"
                    className={[
                      "grid size-9 place-items-center rounded-full text-navy/50 dark:text-wheat",
                      state.view === "list"
                        ? "bg-navy text-ivory dark:bg-gold dark:text-navy-deep"
                        : "",
                    ].join(" ")}
                  >
                    <List className="size-4" />
                  </Link>
                </div>
              </div>
            </div>

            {activeChips.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {activeChips.map((chip) => (
                  <Link
                    key={chip.label}
                    href={chip.href}
                    prefetch={false}
                    className="inline-flex min-h-9 items-center rounded-full border border-gold/35 bg-gold/10 px-3 py-1.5 text-xs font-black text-navy transition-colors hover:bg-gold/20 dark:text-ivory"
                  >
                    {chip.label}
                    <span className="ms-2 text-gold">×</span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <div
            className={
              state.view === "list"
                ? "flex flex-col gap-4"
                : "grid grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] gap-4"
            }
          >
            {slice.map((product, index) => (
              <ProductCard
                key={product.id}
                p={product}
                view={state.view}
                aboveFold={index < (state.view === "list" ? 2 : 4)}
              />
            ))}
          </div>

          {slice.length === 0 ? (
            <div className="grid place-items-center py-16 text-center">
              <span className="mb-4 grid size-16 place-items-center rounded-full bg-sand text-gold dark:bg-navy-mid">
                <Search className="size-7" />
              </span>
              <p className="font-black text-navy/60 dark:text-wheat">
                با این پالایش کالایی پیدا نشد.
              </p>
              <Link
                href="/shop"
                prefetch={false}
                className="mt-4 inline-flex min-h-11 items-center rounded-full bg-navy px-5 text-sm font-black text-ivory dark:bg-gold dark:text-navy-deep"
              >
                پاک کردن فیلتر و جستجو
              </Link>
            </div>
          ) : null}

          {pages > 1 ? (
            <nav className="mt-7 flex flex-wrap justify-center gap-1.5" aria-label="صفحه‌بندی">
              {Array.from({ length: pages }, (_, index) => index + 1).map((item) => (
                <Link
                  key={item}
                  href={toShopHref({ ...state, page: item })}
                  prefetch={false}
                  aria-current={item === page ? "page" : undefined}
                  className={[
                    "inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-black",
                    item === page
                      ? "bg-navy text-ivory dark:bg-gold dark:text-navy-deep"
                      : "border border-navy/10 bg-white text-navy hover:border-gold/50 dark:border-gold/30 dark:bg-slate dark:text-ivory",
                  ].join(" ")}
                >
                  {toFaDigits(item)}
                </Link>
              ))}
            </nav>
          ) : null}
        </section>
      </div>
    </div>
  );
}
