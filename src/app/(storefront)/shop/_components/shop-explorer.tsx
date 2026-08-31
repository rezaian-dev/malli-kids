"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  X,
} from "lucide-react";
import { CATALOG, SEASONS } from "@/lib/data/products";
import { loadCatalog } from "@/lib/admin-sync";
import { CATS, PER_PAGE, PRICE_CAP, SORTS } from "@/lib/constants";
import { formatToman, toFaDigits } from "@/lib/format";
import { ProductCard } from "@/components/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toShopHref, type ShopState } from "../_lib/shop-state";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

const PRICE_PRESETS = [
  { label: "هر قیمتی", hint: "بدون محدودیت", min: 0, max: PRICE_CAP },
  { label: "اقتصادی", hint: "تا ۵۰۰ هزار", min: 0, max: 500_000 },
  { label: "متوسط", hint: "۵۰۰ هزار تا ۱ م", min: 500_000, max: 1_000_000 },
  { label: "بالا", hint: "۱ تا ۲ میلیون", min: 1_000_000, max: 2_000_000 },
  { label: "لوکس", hint: "بالای ۲ میلیون", min: 2_000_000, max: PRICE_CAP },
] as const;

const SORT_META = [
  { k: "new", label: "جدیدترین", hint: "تازه‌ترین دوخت‌ها", Icon: Sparkles },
  {
    k: "price-asc",
    label: "ارزان‌ترین",
    hint: "از کم به زیاد",
    Icon: ArrowDownNarrowWide,
  },
  {
    k: "price-desc",
    label: "گران‌ترین",
    hint: "از زیاد به کم",
    Icon: ArrowUpNarrowWide,
  },
  { k: "rate", label: "بیشترین امتیاز", hint: "محبوب مادران", Icon: Star },
] as const;

const STATUS: { label: string; key: keyof ShopState; hint: string }[] = [
  { label: "فقط موجود", key: "stock", hint: "کالاهای آمادهٔ ارسال" },
  { label: "تخفیف‌دار", key: "disc", hint: "دارای قیمت ویژه" },
  { label: "پرفروش", key: "hot", hint: "منتخب مادران" },
  { label: "جدید", key: "onlyNew", hint: "تازه به گالری رسیده" },
];

const PRICE_STEP = 50_000;
const SECTION_LABEL =
  "flex items-center gap-1.5 text-[11px] font-black tracking-[0.16em] text-gold uppercase";

export function ShopExplorer({ state }: { state: ShopState }) {
  const [catalog, setCatalog] = useState(CATALOG);
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortPopOpen, setSortPopOpen] = useState(false);
  const [query, setQuery] = useState(state.q);
  const [range, setRange] = useState<[number, number]>([state.min, state.max]);

  useEffect(() => setCatalog(loadCatalog()), []);

  const push = useCallback(
    (next: Partial<ShopState>) => {
      router.push(toShopHref({ ...state, ...next }), { scroll: false });
    },
    [router, state],
  );

  useEffect(() => {
    const href = toShopHref(state);
    const current = `${window.location.pathname}${window.location.search}`;
    if (href === current) return;

    const currentParams = new URLSearchParams(window.location.search);
    const nextParams = new URLSearchParams(href.split("?")[1] ?? "");
    const currentQuery =
      currentParams.get("query") ?? currentParams.get("q") ?? "";
    const nextQuery = nextParams.get("query") ?? "";
    const currentCat =
      currentParams.get("category") ?? currentParams.get("cat") ?? "";
    const nextCat = nextParams.get("category") ?? "";

    if (currentQuery !== nextQuery || currentCat !== nextCat) {
      router.replace(href, { scroll: false });
    }
  }, [router, state]);

  useEffect(() => setRange([state.min, state.max]), [state.min, state.max]);

  // 🔎 Keep the search input synced with the URL.
  useEffect(() => setQuery(state.q), [state.q]);
  const typedQ = query.trim();

  const filtered = useMemo(() => {
    const list = catalog.filter((p) => {
      if (state.cat !== "همه" && p.cat !== state.cat) return false;
      if (state.season !== "همه" && p.season !== state.season) return false;
      if (state.q && !p.name.includes(state.q) && !p.cat.includes(state.q))
        return false;
      if (state.stock && !p.stock) return false;
      if (state.disc && !p.disc) return false;
      if (state.hot && p.badge !== "پرفروش") return false;
      if (state.onlyNew && p.badge !== "جدید") return false;
      return p.price >= state.min && p.price <= state.max;
    });
    if (state.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (state.sort === "price-desc")
      list.sort((a, b) => b.price - a.price);
    else if (state.sort === "rate") list.sort((a, b) => b.rate - a.rate);
    return list;
  }, [catalog, state]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const page = Math.min(state.page, pages);
  const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const activeChips = [
    state.cat !== "همه" && {
      label: state.cat,
      clear: () => push({ cat: "همه", page: 1 }),
    },
    state.season !== "همه" && {
      label: state.season,
      clear: () => push({ season: "همه", page: 1 }),
    },
    !!state.q && {
      label: `«${state.q}»`,
      clear: () => push({ q: "", page: 1 }),
    },
    state.stock && {
      label: "فقط موجود",
      clear: () => push({ stock: false, page: 1 }),
    },
    state.disc && {
      label: "تخفیف‌دار",
      clear: () => push({ disc: false, page: 1 }),
    },
    state.hot && {
      label: "پرفروش",
      clear: () => push({ hot: false, page: 1 }),
    },
    state.onlyNew && {
      label: "جدید",
      clear: () => push({ onlyNew: false, page: 1 }),
    },
    (state.min > 0 || state.max !== PRICE_CAP) && {
      label: `${formatToman(state.min)} تا ${formatToman(state.max)}`,
      clear: () => push({ min: 0, max: PRICE_CAP, page: 1 }),
    },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const activeN = activeChips.length;

  function commitQuery() {
    if (typedQ.length === 1) return;
    push({ q: typedQ, page: 1 });
    setFilterOpen(false);
  }

  useEffect(() => {
    if (typedQ.length === 1 || typedQ === state.q) return;
    const id = window.setTimeout(() => push({ q: typedQ, page: 1 }), 180);
    return () => window.clearTimeout(id);
  }, [typedQ, state.q, push]);

  function reset() {
    setQuery("");
    push({
      cat: "همه",
      season: "همه",
      q: "",
      stock: false,
      disc: false,
      hot: false,
      onlyNew: false,
      min: 0,
      max: PRICE_CAP,
      page: 1,
    });
  }

  const sortLabel = SORTS[state.sort] || "جدیدترین";

  /* 🔀 Shared sort UI for desktop and mobile. */
  const sortOptions = (onPick?: () => void) => (
    <ToggleGroup
      type="single"
      value={state.sort}
      onValueChange={(k) => {
        if (!k) return;
        push({ sort: k, page: 1 });
        onPick?.();
      }}
      className="flex w-full flex-col gap-1.5"
      aria-label="مرتب‌سازی"
    >
      {SORT_META.map((s) => (
        <ToggleGroupItem
          key={s.k}
          value={s.k}
          className={cn(
            "bg-cream text-navy hover:border-gold/40 hover:bg-sand h-auto w-full justify-start gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-right",
            "dark:bg-navy-mid dark:text-ivory dark:hover:bg-slate",
            "data-[state=on]:border-gold data-[state=on]:bg-navy data-[state=on]:text-ivory",
            "dark:data-[state=on]:bg-gold dark:data-[state=on]:text-navy-deep",
            "group",
          )}
        >
          <span className="bg-sand text-navy group-data-[state=on]:bg-gold-light dark:bg-dusk-soft dark:text-gold-light dark:group-data-[state=on]:bg-navy dark:group-data-[state=on]:text-gold-light grid size-9 shrink-0 place-items-center rounded-xl">
            <s.Icon className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-black">{s.label}</span>
            <span className="mt-0.5 block text-[11px] font-bold opacity-55 group-data-[state=on]:opacity-70">
              {s.hint}
            </span>
          </span>
          <Check className="size-4 shrink-0 opacity-0 transition group-data-[state=on]:opacity-100" />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );

  /* 🎚️ Shared filter UI for desktop and mobile. */
  const filterBody = (
    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-5">
      {/* 🔎 Search */}
      <div className="space-y-2.5">
        <label htmlFor="shop-search" className={SECTION_LABEL}>
          <Search className="size-3.5" /> جستجو
        </label>
        <span className="dark:bg-navy-mid relative block rounded-2xl bg-white">
          <Search className="text-gold pointer-events-none absolute inset-e-3.5 top-1/2 size-4 -translate-y-1/2" />
          <Input
            id="shop-search"
            type="search"
            inputMode="search"
            autoComplete="off"
            maxLength={60}
            placeholder="پیراهن، سیسمونی…"
            value={query}
            onChange={(event) => setQuery(event.target.value.slice(0, 60))}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              commitQuery();
            }}
            className="border-navy/12 text-navy placeholder:text-navy/35 dark:border-gold/30 dark:text-ivory dark:placeholder:text-wheat h-12 rounded-2xl bg-transparent ps-4 pe-11 text-sm font-bold"
          />
        </span>
      </div>

      {/* Category */}
      <div className="space-y-2.5">
        <p className={SECTION_LABEL}>
          <Tag className="size-3.5" /> دسته‌بندی
        </p>
        <ToggleGroup
          type="single"
          value={state.cat}
          onValueChange={(c) => {
            if (!c) return;
            push({ cat: c, page: 1 });
            setFilterOpen(false);
          }}
          className="flex flex-wrap justify-start gap-1.5"
        >
          {CATS.map((c) => (
            <ToggleGroupItem
              key={c}
              value={c}
              className={cn(
                "border-navy/12 text-navy/70 hover:border-gold/50 hover:text-navy h-auto rounded-full border bg-white px-3.5 py-1.5 text-[12px] font-black",
                "dark:border-gold/25 dark:bg-navy-mid dark:text-wheat dark:hover:border-gold/50",
                "data-[state=on]:bg-navy data-[state=on]:text-ivory data-[state=on]:border-transparent data-[state=on]:shadow-[0_8px_18px_-10px_rgba(14,42,71,.55)]",
                "dark:data-[state=on]:bg-gold dark:data-[state=on]:text-navy-deep",
              )}
            >
              {c}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Season */}
      <div className="space-y-2.5">
        <p className={SECTION_LABEL}>
          <Tag className="size-3.5" /> فصل
        </p>
        <ToggleGroup
          type="single"
          value={state.season}
          onValueChange={(sn) => sn && push({ season: sn, page: 1 })}
          className="flex flex-wrap justify-start gap-1.5"
        >
          {["همه", ...SEASONS].map((sn) => (
            <ToggleGroupItem
              key={sn}
              value={sn}
              className={cn(
                "border-navy/12 text-navy/70 hover:border-gold/50 hover:text-navy h-auto rounded-full border bg-white px-3.5 py-1.5 text-[12px] font-black",
                "dark:border-gold/25 dark:bg-navy-mid dark:text-wheat dark:hover:border-gold/50",
                "data-[state=on]:bg-navy data-[state=on]:text-ivory data-[state=on]:border-transparent data-[state=on]:shadow-[0_8px_18px_-10px_rgba(14,42,71,.55)]",
                "dark:data-[state=on]:bg-gold dark:data-[state=on]:text-navy-deep",
              )}
            >
              {sn}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Status toggles */}
      <div className="space-y-2.5">
        <p className={SECTION_LABEL}>وضعیت کالا</p>
        <div className="space-y-2">
          {STATUS.map(({ label, key, hint }) => {
            const on = state[key] as boolean;
            return (
              <label
                key={key}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 transition ${
                  on
                    ? "border-gold bg-gold-pale/70 dark:border-gold dark:bg-navy-mid"
                    : "border-navy/8 hover:border-gold/40 dark:border-gold/20 dark:bg-navy-mid/60 bg-white"
                }`}
              >
                <span className="min-w-0">
                  <span className="text-navy dark:text-ivory block text-[13px] font-extrabold">
                    {label}
                  </span>
                  <span className="text-navy/45 dark:text-wheat block text-[10.5px] font-bold">
                    {hint}
                  </span>
                </span>
                <Switch
                  checked={on}
                  onCheckedChange={(v) => push({ [key]: v, page: 1 })}
                  aria-label={label}
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Price range: dual slider + presets */}
      <div className="space-y-3">
        <p className={SECTION_LABEL}>بازه قیمت</p>
        <div className="border-navy/8 dark:border-gold/20 dark:bg-navy-mid/60 rounded-2xl border bg-white p-4">
          <div className="text-navy dark:text-ivory mb-4 flex items-center justify-between text-[12px] font-black">
            <span className="bg-sand dark:bg-dusk-soft rounded-lg px-2.5 py-1">
              {formatToman(range[0])}
            </span>
            <span className="text-navy/40 dark:text-wheat text-[10px] font-bold">
              تومان
            </span>
            <span className="bg-sand dark:bg-dusk-soft rounded-lg px-2.5 py-1">
              {range[1] >= PRICE_CAP
                ? `${formatToman(PRICE_CAP)}+`
                : formatToman(range[1])}
            </span>
          </div>
          <Slider
            dir="rtl"
            min={0}
            max={PRICE_CAP}
            step={PRICE_STEP}
            value={range}
            onValueChange={(v) => setRange([v[0], v[1]] as [number, number])}
            onValueCommit={(v) => push({ min: v[0], max: v[1], page: 1 })}
            aria-label="بازه قیمت"
          />
        </div>
        <ToggleGroup
          type="single"
          value={
            PRICE_PRESETS.some(
              (p) => p.min === state.min && p.max === state.max,
            )
              ? `${state.min}-${state.max}`
              : ""
          }
          onValueChange={(v) => {
            if (!v) return;
            const [min, max] = v.split("-").map(Number);
            push({ min, max, page: 1 });
          }}
          className="grid w-full grid-cols-2 gap-1.5"
        >
          {PRICE_PRESETS.map((p) => (
            <ToggleGroupItem
              key={p.label}
              value={`${p.min}-${p.max}`}
              className={cn(
                "group border-navy/8 text-navy hover:border-gold/45 h-auto flex-col items-start rounded-2xl border bg-white px-3 py-2.5 text-right",
                "dark:border-gold/20 dark:bg-navy-mid dark:text-ivory",
                "data-[state=on]:border-gold data-[state=on]:bg-navy data-[state=on]:text-ivory",
                "dark:data-[state=on]:bg-gold dark:data-[state=on]:text-navy-deep",
                p.label === "هر قیمتی" && "col-span-2",
              )}
            >
              <span className="block text-[12px] font-black">{p.label}</span>
              <span className="text-navy/40 group-data-[state=on]:text-gold-soft dark:text-wheat dark:group-data-[state=on]:text-navy/70 mt-0.5 block text-[10px] font-bold">
                {p.hint}
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );

  const filterHead = (
    <div className="border-navy/8 dark:border-gold/20 dark:bg-navy-dark/60 flex items-center justify-between gap-3 border-b bg-white/70 px-4 py-4">
      <div className="flex items-center gap-2.5">
        <span className="bg-navy text-gold dark:bg-gold dark:text-navy-deep grid size-10 place-items-center rounded-2xl shadow-[0_10px_22px_-12px_rgba(14,42,71,.7)]">
          <SlidersHorizontal className="size-4" />
        </span>
        <div>
          <p className="text-navy dark:text-ivory text-sm font-black">
            فیلتر محصولات
          </p>
          <p className="text-navy/45 dark:text-gold-soft mt-0.5 text-[10px] font-bold">
            {activeN ? `${toFaDigits(activeN)} مورد فعال` : "بدون فیلتر"}
          </p>
        </div>
      </div>
      {activeN ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-gold hover:bg-gold/10 h-8 rounded-full px-3 text-[11px] font-black"
          onClick={reset}
        >
          پاک کردن
        </Button>
      ) : null}
    </div>
  );

  return (
    <div className="shop-page container mx-auto w-full px-4 sm:px-5 lg:px-7">
      <p className="text-navy/45 dark:text-wheat mb-5 text-xs font-bold">
        خانه <span className="text-gold mx-1.5">/</span> فروشگاه
        {state.cat !== "همه" ? (
          <>
            {" "}
            <span className="text-gold mx-1.5">/</span> {state.cat}
          </>
        ) : null}
      </p>

      <div className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-7">
        {/* Desktop sidebar filter */}
        <aside className="border-navy/10 bg-sand-deep/60 dark:border-gold/40 dark:bg-filter-night sticky top-30 hidden overflow-hidden rounded-[28px] border shadow-[0_20px_44px_-28px_rgba(14,42,71,.4)] backdrop-blur-sm lg:flex lg:flex-col">
          {filterHead}
          {filterBody}
        </aside>

        {/* Main results */}
        <section className="border-navy/10 dark:border-gold/35 dark:bg-slate/45 dark:text-ivory min-w-0 rounded-[28px] border bg-white/85 p-3 shadow-[0_22px_54px_-30px_rgba(14,42,71,.32)] backdrop-blur-sm sm:p-5">
          {/* Toolbar */}
          <div className="border-navy/6 dark:border-gold/15 mb-4 flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-navy dark:text-ivory text-lg font-black sm:text-xl">
                کالکشن پوشاک کودک
              </h1>
              <p className="text-navy/45 dark:text-wheat mt-1 text-xs">
                {toFaDigits(filtered.length)} مدل در کالکشن
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="navy"
                className="h-10 px-4 lg:hidden"
                onClick={() => setFilterOpen(true)}
              >
                <SlidersHorizontal className="size-4" /> فیلتر
                {activeN ? (
                  <span className="bg-gold text-navy-deep grid size-5 place-items-center rounded-full text-[10px] font-black">
                    {toFaDigits(activeN)}
                  </span>
                ) : null}
              </Button>

              {/* Desktop sort — Popover (non-modal → no scroll-lock, no layout shift) */}
              <div className="hidden lg:block">
                <Popover
                  modal={false}
                  open={sortPopOpen}
                  onOpenChange={setSortPopOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-navy/12 bg-sand text-navy hover:border-gold/50 aria-expanded:border-gold dark:border-gold/40 dark:bg-dusk-mid dark:text-linen h-auto min-w-44 justify-between rounded-full px-4 py-2.5 text-xs font-black"
                    >
                      <span className="flex items-center gap-1.5">
                        <ArrowUpDown className="text-gold-soft size-4" />{" "}
                        {sortLabel}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    sideOffset={10}
                    className="border-navy/12 bg-linen dark:border-gold/40 dark:bg-sort-sheet w-72"
                  >
                    <p className="text-gold px-2 pt-1 pb-2 text-[11px] font-black tracking-[0.14em] uppercase">
                      مرتب‌سازی
                    </p>
                    {sortOptions(() => setSortPopOpen(false))}
                  </PopoverContent>
                </Popover>
              </div>

              {/* Mobile sort — bottom Sheet */}
              <Button
                type="button"
                variant="outline"
                className="border-navy/12 bg-sand text-navy xs:min-w-36 xs:flex-none dark:border-gold/40 dark:bg-dusk-mid dark:text-linen h-auto min-w-0 flex-1 justify-between rounded-full px-3 py-2.5 text-xs font-black lg:hidden"
                onClick={() => setSortOpen(true)}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <ArrowUpDown className="text-gold-soft size-4" /> {sortLabel}
                </span>
              </Button>

              {/* View toggle */}
              <ToggleGroup
                type="single"
                value={state.view}
                onValueChange={(v) => v && push({ view: v as "grid" | "list" })}
                className="border-navy/10 bg-sand dark:border-gold/30 dark:bg-dusk-mid inline-flex rounded-full border p-0.5"
              >
                {(
                  [
                    ["grid", LayoutGrid, "نمای شبکه"],
                    ["list", List, "نمای فهرست"],
                  ] as const
                ).map(([v, Icon, label]) => (
                  <ToggleGroupItem
                    key={v}
                    value={v}
                    aria-label={label}
                    className={cn(
                      "text-navy/50 dark:text-wheat size-9 rounded-full border-0",
                      "data-[state=on]:bg-navy data-[state=on]:text-ivory",
                      "dark:data-[state=on]:bg-gold dark:data-[state=on]:text-navy-deep",
                    )}
                  >
                    <Icon className="size-4" />
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>

          {/* Grid / List */}
          <div
            className={
              state.view === "list"
                ? "flex flex-col gap-4"
                : "grid grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] gap-4"
            }
          >
            {slice.map((p, index) => (
              <ProductCard
                key={p.id}
                p={p}
                view={state.view}
                aboveFold={index < (state.view === "list" ? 2 : 4)}
              />
            ))}
          </div>

          {slice.length === 0 ? (
            <div className="grid place-items-center py-16 text-center">
              <span className="bg-sand text-gold dark:bg-navy-mid mb-4 grid size-16 place-items-center rounded-full">
                <Search className="size-7" />
              </span>
              <p className="text-navy/60 dark:text-wheat font-black">
                با این پالایش کالایی پیدا نشد.
              </p>
              {activeN ? (
                <Button
                  type="button"
                  variant="navy"
                  className="mt-4 px-5"
                  onClick={reset}
                >
                  پاک کردن فیلتر و جستجو
                </Button>
              ) : null}
            </div>
          ) : null}

          {/* Pagination */}
          {pages > 1 ? (
            <nav
              className="mt-7 flex flex-wrap justify-center gap-1.5"
              aria-label="صفحه‌بندی"
            >
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant={n === page ? "default" : "outline"}
                  onClick={() => push({ page: n })}
                  aria-current={n === page ? "page" : undefined}
                  className={cn(
                    "h-11 min-w-11 rounded-full px-3 text-sm font-black",
                    n === page
                      ? "bg-navy text-ivory hover:bg-navy-mid dark:bg-gold dark:text-navy-deep dark:hover:bg-gold-light"
                      : "border-navy/10 text-navy hover:border-gold/50 dark:border-gold/30 dark:bg-slate dark:text-ivory bg-white",
                  )}
                >
                  {toFaDigits(n)}
                </Button>
              ))}
            </nav>
          ) : null}
        </section>
      </div>

      {/* Mobile filter — right Sheet */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="border-navy/10 bg-sand-deep dark:border-gold/40 dark:bg-filter-night inset-y-0 right-0 flex h-dvh w-[min(88vw,360px)] max-w-90 flex-col gap-0 border-s p-0 sm:max-w-90"
        >
          <SheetHeader className="gap-0 p-0">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-2.5">
                <span className="bg-navy text-gold dark:bg-gold dark:text-navy-deep grid size-10 place-items-center rounded-2xl">
                  <SlidersHorizontal className="size-4" />
                </span>
                <div className="text-right">
                  <SheetTitle className="text-navy dark:text-ivory text-sm font-black">
                    فیلتر کالکشن
                  </SheetTitle>
                  <SheetDescription className="text-navy/45 dark:text-gold-soft mt-0.5 text-[10px]">
                    {activeN
                      ? `${toFaDigits(activeN)} مورد فعال`
                      : "بدون فیلتر"}
                  </SheetDescription>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {activeN ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-gold h-8 rounded-full px-2 text-[11px] font-black"
                    onClick={reset}
                  >
                    پاک کردن
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="bg-navy/5 text-navy dark:bg-dusk-mid dark:text-ivory size-9 rounded-full"
                  onClick={() => setFilterOpen(false)}
                  aria-label="بستن"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>
          <Separator className="bg-navy/8 dark:bg-gold/20" />
          {filterBody}
          <div className="border-navy/10 dark:border-gold/25 border-t p-3">
            <Button
              type="button"
              variant="navy"
              className="h-12 w-full font-black"
              onClick={() => setFilterOpen(false)}
            >
              نمایش {toFaDigits(filtered.length)} کالا
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile sort — bottom Sheet */}
      <Sheet open={sortOpen} onOpenChange={setSortOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="border-gold/30 bg-linen dark:border-gold/40 dark:bg-sort-sheet mx-auto max-w-130 gap-0 rounded-t-[28px] border-t p-0"
        >
          <div
            className="bg-gold-light mx-auto mt-3 mb-1 h-1.25 w-11 rounded-full"
            aria-hidden
          />
          <SheetHeader className="gap-0 px-5 pt-1 pb-3">
            <SheetTitle className="text-navy dark:text-linen text-base font-black">
              مرتب‌سازی کالاها
            </SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-5">
            {sortOptions(() => setSortOpen(false))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
