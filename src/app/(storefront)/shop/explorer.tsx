"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDownNarrowWide, ArrowUpDown, ArrowUpNarrowWide, Check, LayoutGrid, List, Search, SlidersHorizontal, Sparkles, Star, Tag, X } from "lucide-react";
import { CATALOG, SEASONS } from "@/lib/data/products";
import { loadCatalog } from "@/lib/admin-sync";
import { CATS, PER_PAGE, PRICE_CAP, SORTS } from "@/lib/constants";
import { formatToman, toFaDigits } from "@/lib/format";
import { Card } from "@/features/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppForm, Field, useAppForm } from "@/components/form";
import { shopFiltersSchema, type ShopFiltersValues } from "./schema";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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
  { k: "price-asc", label: "ارزان‌ترین", hint: "از کم به زیاد", Icon: ArrowDownNarrowWide },
  { k: "price-desc", label: "گران‌ترین", hint: "از زیاد به کم", Icon: ArrowUpNarrowWide },
  { k: "rate", label: "بیشترین امتیاز", hint: "محبوب مادران", Icon: Star },
] as const;

const STATUS: { label: string; key: keyof State; hint: string }[] = [
  { label: "فقط موجود", key: "stock", hint: "کالاهای آمادهٔ ارسال" },
  { label: "تخفیف‌دار", key: "disc", hint: "دارای قیمت ویژه" },
  { label: "پرفروش", key: "hot", hint: "منتخب مادران" },
  { label: "جدید", key: "onlyNew", hint: "تازه به گالری رسیده" },
];

const PRICE_STEP = 50_000;
const SECTION_LABEL = "flex items-center gap-1.5 text-[11px] font-black tracking-[0.16em] text-gold uppercase";

type State = {
  cat: string;
  season: string;
  page: number;
  sort: string;
  view: "grid" | "list";
  stock: boolean;
  disc: boolean;
  hot: boolean;
  onlyNew: boolean;
  q: string;
  min: number;
  max: number;
};

export function Explorer() {
  const [catalog, setCatalog] = useState(CATALOG);
  useEffect(() => setCatalog(loadCatalog()), []);
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortPopOpen, setSortPopOpen] = useState(false);
  const requestedCategory = params.get("cat");
  const activeCategory = requestedCategory && CATS.some((category) => category === requestedCategory) ? requestedCategory : "همه";

  const state: State = {
    cat: activeCategory,
    season: params.get("season") || "همه",
    page: parseInt(params.get("page") || "1", 10) || 1,
    sort: params.get("sort") || "new",
    view: params.get("view") === "list" ? "list" : "grid",
    stock: params.get("stock") === "1",
    disc: params.get("disc") === "1",
    hot: params.get("hot") === "1",
    onlyNew: params.get("new") === "1",
    q: (params.get("q") || "").trim(),
    min: parseInt(params.get("min") || "0", 10) || 0,
    max: parseInt(params.get("max") || String(PRICE_CAP), 10),
  };

  // Local slider range for smooth dragging; committed to the URL on release.
  const [range, setRange] = useState<[number, number]>([state.min, state.max]);
  useEffect(() => setRange([state.min, state.max]), [state.min, state.max]);

  // فرمِ «جستجو»: مقدارِ URL داخلِ فرم می‌نشیند و هر عبارتِ معتبر بی‌درنگ به URL برمی‌گردد
  const filters = useAppForm({
    schema: shopFiltersSchema,
    defaultValues: { q: state.q },
    mode: "onSubmit",
  });
  const typedQ = (filters.watch("q") || "").trim();

  function push(next: Partial<State>) {
    const s = { ...state, ...next };
    const usp = new URLSearchParams();
    if (s.cat !== "همه") usp.set("cat", s.cat);
    if (s.season !== "همه") usp.set("season", s.season);
    if (s.page > 1) usp.set("page", String(s.page));
    if (s.sort !== "new") usp.set("sort", s.sort);
    if (s.view === "list") usp.set("view", "list");
    if (s.stock) usp.set("stock", "1");
    if (s.disc) usp.set("disc", "1");
    if (s.hot) usp.set("hot", "1");
    if (s.onlyNew) usp.set("new", "1");
    if (s.q) usp.set("q", s.q);
    if (s.min) usp.set("min", String(s.min));
    if (s.max !== PRICE_CAP) usp.set("max", String(s.max));
    router.push(`${path}?${usp}`, { scroll: false });
  }

  const filtered = useMemo(() => {
    const list = catalog.filter((p) => {
      if (state.cat !== "همه" && p.cat !== state.cat) return false;
      if (state.season !== "همه" && p.season !== state.season) return false;
      if (state.q && !p.name.includes(state.q) && !p.cat.includes(state.q)) return false;
      if (state.stock && !p.stock) return false;
      if (state.disc && !p.disc) return false;
      if (state.hot && p.badge !== "پرفروش") return false;
      if (state.onlyNew && p.badge !== "جدید") return false;
      return p.price >= state.min && p.price <= state.max;
    });
    if (state.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (state.sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (state.sort === "rate") list.sort((a, b) => b.rate - a.rate);
    return list;
  }, [state]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const page = Math.min(state.page, pages);
  const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const activeChips = [
    state.cat !== "همه" && { label: state.cat, clear: () => push({ cat: "همه", page: 1 }) },
    state.season !== "همه" && { label: state.season, clear: () => push({ season: "همه", page: 1 }) },
    !!state.q && { label: `«${state.q}»`, clear: () => push({ q: "", page: 1 }) },
    state.stock && { label: "فقط موجود", clear: () => push({ stock: false, page: 1 }) },
    state.disc && { label: "تخفیف‌دار", clear: () => push({ disc: false, page: 1 }) },
    state.hot && { label: "پرفروش", clear: () => push({ hot: false, page: 1 }) },
    state.onlyNew && { label: "جدید", clear: () => push({ onlyNew: false, page: 1 }) },
    (state.min > 0 || state.max !== PRICE_CAP) && {
      label: `${formatToman(state.min)} تا ${formatToman(state.max)}`,
      clear: () => push({ min: 0, max: PRICE_CAP, page: 1 }),
    },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const activeN = activeChips.length;

  /** «Enter» یعنی ثبتِ فیلترِ جستجو: به صفحهٔ اول می‌رویم و پنلِ موبایل بسته می‌شود */
  function commitFilters(v: ShopFiltersValues) {
    push({ q: v.q.trim(), page: 1 });
    setFilterOpen(false);
  }

  /** آدرس از بیرون عوض شد (لینک، دکمهٔ «پاک کردن»، بازگشت) → فرم هم‌راستا می‌شود */
  useEffect(() => {
    if (state.q !== filters.getValues("q")) filters.reset({ q: state.q });
  }, [state.q, filters]);

  /** تایپِ معتبر → URL. یک‌حرفی هنوز معتبر نیست، پس آدرس دست‌نخورده می‌ماند. */
  useEffect(() => {
    if (typedQ.length === 1) return;
    if (typedQ !== state.q) push({ q: typedQ, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typedQ]);

  function reset() {
    push({ cat: "همه", season: "همه", q: "", stock: false, disc: false, hot: false, onlyNew: false, min: 0, max: PRICE_CAP, page: 1 });
  }

  const sortLabel = SORTS[state.sort] || "جدیدترین";

  /* ---------- Sort options list (shared by Popover + mobile Sheet) ---------- */
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
            "h-auto w-full justify-start gap-3 rounded-2xl border border-transparent bg-cream px-3 py-2.5 text-right text-navy hover:border-gold/40 hover:bg-sand",
            "dark:bg-navy-mid dark:text-ivory dark:hover:bg-slate",
            "data-[state=on]:border-gold data-[state=on]:bg-navy data-[state=on]:text-ivory",
            "dark:data-[state=on]:bg-gold dark:data-[state=on]:text-navy-deep",
            "group",
          )}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sand text-navy group-data-[state=on]:bg-gold-light dark:bg-dusk-soft dark:text-gold-light dark:group-data-[state=on]:bg-navy dark:group-data-[state=on]:text-gold-light">
            <s.Icon className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-black">{s.label}</span>
            <span className="mt-0.5 block text-[11px] font-bold opacity-55 group-data-[state=on]:opacity-70">{s.hint}</span>
          </span>
          <Check className="size-4 shrink-0 opacity-0 transition group-data-[state=on]:opacity-100" />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );

  /* ---------- Filter body (shared by desktop sidebar + mobile Sheet) ---------- */
  const filterBody = (
    <AppForm
      form={filters}
      onSubmit={commitFilters}
      ariaLabel="فیلتر محصولات"
      className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-5"
    >
      {/* Search */}
      <div className="space-y-2.5">
        <Field name="q" skin="soft" noShell label={<><Search className="size-3.5" /> جستجو</>} labelClassName={SECTION_LABEL}>
          {({ field, invalid, id, describedBy }) => (
            <span className="relative block">
              <Search className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-gold" />
              <Input
                id={id}
                type="search"
                inputMode="search"
                autoComplete="off"
                placeholder="پیراهن، سیسمونی…"
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                name={field.name}
                value={(field.value as string) ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                onKeyDown={(e) => {
                  // فرمِ فیلترها دکمهٔ submit ندارد، پس «Enter» را خودکار می‌فرستیم
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void filters.handleSubmit(commitFilters)();
                  }
                }}
                ref={field.ref}
                className="h-12 rounded-2xl border-navy/12 bg-white pe-11 ps-4 text-sm font-bold text-navy shadow-inner placeholder:text-navy/35 dark:border-gold/30 dark:bg-navy-mid dark:text-ivory dark:placeholder:text-wheat"
              />
            </span>
          )}
        </Field>
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
            // روی موبایل فیلترها در Sheet بازند؛ با انتخابِ دسته، sheet بسته می‌شود
            // تا کاربر مستقیم روی صفحهٔ لیستِ محصولات فرود بیاید.
            setFilterOpen(false);
          }}
          className="flex flex-wrap justify-start gap-1.5"
        >
          {CATS.map((c) => (
            <ToggleGroupItem key={c} value={c} className={cn(
                  "h-auto rounded-full border border-navy/12 bg-white px-3.5 py-1.5 text-[12px] font-black text-navy/70 hover:border-gold/50 hover:text-navy",
                  "dark:border-gold/25 dark:bg-navy-mid dark:text-wheat dark:hover:border-gold/50",
                  "data-[state=on]:border-transparent data-[state=on]:bg-navy data-[state=on]:text-ivory data-[state=on]:shadow-[0_8px_18px_-10px_rgba(14,42,71,.55)]",
                  "dark:data-[state=on]:bg-gold dark:data-[state=on]:text-navy-deep",
                )}>
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
            <ToggleGroupItem key={sn} value={sn} className={cn(
                  "h-auto rounded-full border border-navy/12 bg-white px-3.5 py-1.5 text-[12px] font-black text-navy/70 hover:border-gold/50 hover:text-navy",
                  "dark:border-gold/25 dark:bg-navy-mid dark:text-wheat dark:hover:border-gold/50",
                  "data-[state=on]:border-transparent data-[state=on]:bg-navy data-[state=on]:text-ivory data-[state=on]:shadow-[0_8px_18px_-10px_rgba(14,42,71,.55)]",
                  "dark:data-[state=on]:bg-gold dark:data-[state=on]:text-navy-deep",
                )}>
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
                    : "border-navy/8 bg-white hover:border-gold/40 dark:border-gold/20 dark:bg-navy-mid/60"
                }`}
              >
                <span className="min-w-0">
                  <span className="block text-[13px] font-extrabold text-navy dark:text-ivory">{label}</span>
                  <span className="block text-[10.5px] font-bold text-navy/45 dark:text-wheat">{hint}</span>
                </span>
                <Switch checked={on} onCheckedChange={(v) => push({ [key]: v, page: 1 })} aria-label={label} />
              </label>
            );
          })}
        </div>
      </div>

      {/* Price range: dual slider + presets */}
      <div className="space-y-3">
        <p className={SECTION_LABEL}>بازه قیمت</p>
        <div className="rounded-2xl border border-navy/8 bg-white p-4 dark:border-gold/20 dark:bg-navy-mid/60">
          <div className="mb-4 flex items-center justify-between text-[12px] font-black text-navy dark:text-ivory">
            <span className="rounded-lg bg-sand px-2.5 py-1 dark:bg-dusk-soft">{formatToman(range[0])}</span>
            <span className="text-[10px] font-bold text-navy/40 dark:text-wheat">تومان</span>
            <span className="rounded-lg bg-sand px-2.5 py-1 dark:bg-dusk-soft">
              {range[1] >= PRICE_CAP ? `${formatToman(PRICE_CAP)}+` : formatToman(range[1])}
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
          value={PRICE_PRESETS.some((p) => p.min === state.min && p.max === state.max) ? `${state.min}-${state.max}` : ""}
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
                "group h-auto flex-col items-start rounded-2xl border border-navy/8 bg-white px-3 py-2.5 text-right text-navy hover:border-gold/45",
                "dark:border-gold/20 dark:bg-navy-mid dark:text-ivory",
                "data-[state=on]:border-gold data-[state=on]:bg-navy data-[state=on]:text-ivory",
                "dark:data-[state=on]:bg-gold dark:data-[state=on]:text-navy-deep",
                p.label === "هر قیمتی" && "col-span-2",
              )}
            >
              <span className="block text-[12px] font-black">{p.label}</span>
              <span className="mt-0.5 block text-[10px] font-bold text-navy/40 group-data-[state=on]:text-gold-soft dark:text-wheat dark:group-data-[state=on]:text-navy/70">
                {p.hint}
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </AppForm>
  );

  const filterHead = (
    <div className="flex items-center justify-between gap-3 border-b border-navy/8 bg-white/70 px-4 py-4 dark:border-gold/20 dark:bg-navy-dark/60">
      <div className="flex items-center gap-2.5">
        <span className="grid size-10 place-items-center rounded-2xl bg-navy text-gold shadow-[0_10px_22px_-12px_rgba(14,42,71,.7)] dark:bg-gold dark:text-navy-deep">
          <SlidersHorizontal className="size-4" />
        </span>
        <div>
          <p className="text-sm font-black text-navy dark:text-ivory">فیلتر محصولات</p>
          <p className="mt-0.5 text-[10px] font-bold text-navy/45 dark:text-gold-soft">
            {activeN ? `${toFaDigits(activeN)} مورد فعال` : "بدون فیلتر"}
          </p>
        </div>
      </div>
      {activeN ? (
        <Button type="button" variant="ghost" size="sm" className="h-8 rounded-full px-3 text-[11px] font-black text-gold hover:bg-gold/10" onClick={reset}>
          پاک کردن
        </Button>
      ) : null}
    </div>
  );

  return (
    <div className="shop-page container mx-auto w-full px-4 sm:px-5 lg:px-7">
      <p className="mb-5 text-xs font-bold text-navy/45 dark:text-wheat">
        خانه <span className="mx-1.5 text-gold">/</span> فروشگاه
        {state.cat !== "همه" ? (
          <>
            {" "}
            <span className="mx-1.5 text-gold">/</span> {state.cat}
          </>
        ) : null}
      </p>

      <div className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-7">
        {/* Desktop sidebar filter */}
        <aside className="sticky top-[7.5rem] hidden overflow-hidden rounded-[28px] border border-navy/10 bg-sand-deep/60 shadow-[0_20px_44px_-28px_rgba(14,42,71,.4)] backdrop-blur-sm dark:border-gold/40 dark:bg-filter-night lg:flex lg:flex-col">
          {filterHead}
          {filterBody}
        </aside>

        {/* Main results */}
        <section className="min-w-0 rounded-[28px] border border-navy/10 bg-white/85 p-3 shadow-[0_22px_54px_-30px_rgba(14,42,71,.32)] backdrop-blur-sm dark:border-gold/35 dark:bg-slate/45 dark:text-ivory sm:p-5">
          {/* Toolbar */}
          <div className="mb-4 flex flex-col justify-between gap-3 border-b border-navy/6 pb-4 dark:border-gold/15 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-lg font-black text-navy dark:text-ivory sm:text-xl">کالکشن پوشاک کودک</h1>
              <p className="mt-1 text-xs text-navy/45 dark:text-wheat">{toFaDigits(filtered.length)} مدل در کالکشن</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="navy" className="h-10 px-4 lg:hidden" onClick={() => setFilterOpen(true)}>
                <SlidersHorizontal className="size-4" /> فیلتر
                {activeN ? <span className="grid size-5 place-items-center rounded-full bg-gold text-[10px] font-black text-navy-deep">{toFaDigits(activeN)}</span> : null}
              </Button>

              {/* Desktop sort — Popover (non-modal → no scroll-lock, no layout shift) */}
              <div className="hidden lg:block">
                <Popover modal={false} open={sortPopOpen} onOpenChange={setSortPopOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-auto min-w-[11rem] justify-between rounded-full border-navy/12 bg-sand px-4 py-2.5 text-xs font-black text-navy hover:border-gold/50 aria-expanded:border-gold dark:border-gold/40 dark:bg-dusk-mid dark:text-linen"
                    >
                      <span className="flex items-center gap-1.5">
                        <ArrowUpDown className="size-4 text-gold-soft" /> {sortLabel}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" sideOffset={10} className="w-72 border-navy/12 bg-linen dark:border-gold/40 dark:bg-sort-sheet">
                    <p className="px-2 pt-1 pb-2 text-[11px] font-black tracking-[0.14em] text-gold uppercase">مرتب‌سازی</p>
                    {sortOptions(() => setSortPopOpen(false))}
                  </PopoverContent>
                </Popover>
              </div>

              {/* Mobile sort — bottom Sheet */}
              <Button
                type="button"
                variant="outline"
                className="h-auto min-w-0 flex-1 justify-between rounded-full border-navy/12 bg-sand px-3 py-2.5 text-xs font-black text-navy xs:min-w-[9rem] xs:flex-none lg:hidden dark:border-gold/40 dark:bg-dusk-mid dark:text-linen"
                onClick={() => setSortOpen(true)}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <ArrowUpDown className="size-4 text-gold-soft" /> {sortLabel}
                </span>
              </Button>

              {/* View toggle */}
              <ToggleGroup
                type="single"
                value={state.view}
                onValueChange={(v) => v && push({ view: v as "grid" | "list" })}
                className="inline-flex rounded-full border border-navy/10 bg-sand p-0.5 dark:border-gold/30 dark:bg-dusk-mid"
              >
                {([["grid", LayoutGrid, "نمای شبکه"], ["list", List, "نمای فهرست"]] as const).map(([v, Icon, label]) => (
                  <ToggleGroupItem
                    key={v}
                    value={v}
                    aria-label={label}
                    className={cn(
                      "size-9 rounded-full border-0 text-navy/50 dark:text-wheat",
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
          <div className={state.view === "list" ? "flex flex-col gap-4" : "grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 sm:gap-4 min-[900px]:grid-cols-3 min-[1500px]:grid-cols-4"}>
            {slice.map((p) => (
              <Card key={p.id} p={p} view={state.view} priority={slice.slice(0, 4).some((aboveFold) => aboveFold.img === p.img)} />
            ))}
          </div>

          {slice.length === 0 ? (
            <div className="grid place-items-center py-16 text-center">
              <span className="mb-4 grid size-16 place-items-center rounded-full bg-sand text-gold dark:bg-navy-mid">
                <Search className="size-7" />
              </span>
              <p className="font-black text-navy/60 dark:text-wheat">با این پالایش کالایی پیدا نشد.</p>
              {activeN ? (
                <Button type="button" variant="navy" className="mt-4 px-5" onClick={reset}>
                  پاک کردن فیلتر و جستجو
                </Button>
              ) : null}
            </div>
          ) : null}

          {/* Pagination */}
          {pages > 1 ? (
            <nav className="mt-7 flex flex-wrap justify-center gap-1.5" aria-label="صفحه‌بندی">
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
                      : "border-navy/10 bg-white text-navy hover:border-gold/50 dark:border-gold/30 dark:bg-slate dark:text-ivory",
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
        <SheetContent side="right" showCloseButton={false} className="inset-y-0 right-0 flex h-dvh w-[min(88vw,360px)] max-w-[360px] flex-col gap-0 border-s border-navy/10 bg-sand-deep p-0 sm:max-w-[360px] dark:border-gold/40 dark:bg-filter-night">
          <SheetHeader className="gap-0 p-0">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-2xl bg-navy text-gold dark:bg-gold dark:text-navy-deep">
                  <SlidersHorizontal className="size-4" />
                </span>
                <div className="text-right">
                  <SheetTitle className="text-sm font-black text-navy dark:text-ivory">فیلتر کالکشن</SheetTitle>
                  <SheetDescription className="mt-0.5 text-[10px] text-navy/45 dark:text-gold-soft">
                    {activeN ? `${toFaDigits(activeN)} مورد فعال` : "بدون فیلتر"}
                  </SheetDescription>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {activeN ? (
                  <Button type="button" variant="ghost" size="sm" className="h-8 rounded-full px-2 text-[11px] font-black text-gold" onClick={reset}>
                    پاک کردن
                  </Button>
                ) : null}
                <Button type="button" variant="ghost" size="icon" className="size-9 rounded-full bg-navy/5 text-navy dark:bg-dusk-mid dark:text-ivory" onClick={() => setFilterOpen(false)} aria-label="بستن">
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>
          <Separator className="bg-navy/8 dark:bg-gold/20" />
          {filterBody}
          <div className="border-t border-navy/10 p-3 dark:border-gold/25">
            <Button type="button" variant="navy" className="h-12 w-full font-black" onClick={() => setFilterOpen(false)}>
              نمایش {toFaDigits(filtered.length)} کالا
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile sort — bottom Sheet */}
      <Sheet open={sortOpen} onOpenChange={setSortOpen}>
        <SheetContent side="bottom" showCloseButton={false} className="mx-auto max-w-[32.5rem] gap-0 rounded-t-[28px] border-t border-gold/30 bg-linen p-0 dark:border-gold/40 dark:bg-sort-sheet">
          <div className="mx-auto mt-3 mb-1 h-[5px] w-11 rounded-full bg-gold-light" aria-hidden />
          <SheetHeader className="flex-row items-center justify-between gap-0 px-5 pt-1 pb-3">
            <SheetTitle className="text-base font-black text-navy dark:text-linen">مرتب‌سازی کالاها</SheetTitle>
            <Button type="button" variant="ghost" size="icon" className="size-9 rounded-full bg-navy text-ivory dark:bg-gold-light dark:text-navy" onClick={() => setSortOpen(false)} aria-label="بستن">
              <X className="size-4" />
            </Button>
          </SheetHeader>
          <div className="px-4 pb-5">{sortOptions(() => setSortOpen(false))}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
