import { Search, Tag } from "lucide-react";
import { CATS, PRICE_CAP } from "@/lib/constants";
import { SEASONS } from "@/lib/data/products";
import { formatToman } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type { ShopState } from "../_lib/shop-state";

const PRICE_PRESETS = [
  { label: "هر قیمتی", hint: "بدون محدودیت", min: 0, max: PRICE_CAP },
  { label: "اقتصادی", hint: "تا ۵۰۰ هزار", min: 0, max: 500_000 },
  { label: "متوسط", hint: "۵۰۰ هزار تا ۱ م", min: 500_000, max: 1_000_000 },
  { label: "بالا", hint: "۱ تا ۲ میلیون", min: 1_000_000, max: 2_000_000 },
  { label: "لوکس", hint: "بالای ۲ میلیون", min: 2_000_000, max: PRICE_CAP },
] as const;

const STATUS: { label: string; key: keyof ShopState; hint: string }[] = [
  { label: "فقط موجود", key: "stock", hint: "کالاهای آمادهٔ ارسال" },
  { label: "تخفیف‌دار", key: "disc", hint: "دارای قیمت ویژه" },
  { label: "پرفروش", key: "hot", hint: "منتخب مادران" },
  { label: "جدید", key: "onlyNew", hint: "تازه به گالری رسیده" },
];

const PRICE_STEP = 50_000;

// ♿ brown-mid, not gold, in light mode: gold-on-white sidebar text is
// ~2.2:1, below the 4.5:1 minimum. Dark mode keeps the original gold,
// which already passes against the dark sidebar background.
const SECTION_LABEL =
  "flex items-center gap-1.5 text-[11px] font-black tracking-[0.16em] text-brown-mid dark:text-gold uppercase";

const FILTER_CHIP = cn(
  "h-auto rounded-full border px-3.5 py-1.5 text-xs font-black",
  "border-navy/12 bg-white text-navy/70 hover:border-gold/50 hover:bg-sand hover:text-navy",
  "data-[state=on]:border-transparent data-[state=on]:bg-navy data-[state=on]:text-ivory data-[state=on]:shadow-[0_8px_18px_-10px_rgba(14,42,71,.55)] data-[state=on]:hover:bg-navy data-[state=on]:hover:text-ivory",
  "dark:border-gold/25 dark:bg-navy-mid dark:text-wheat dark:hover:border-gold/50 dark:hover:bg-navy-light dark:hover:text-ivory dark:data-[state=on]:bg-gold dark:data-[state=on]:text-navy-deep dark:data-[state=on]:hover:bg-gold dark:data-[state=on]:hover:text-navy-deep",
);

/** 🎚️ Search, category, season, status, and price filters — shared by
 *  the desktop sidebar and the mobile filter sheet. */
export function ShopFilters({
  state,
  query,
  onQueryChange,
  onCommitQuery,
  range,
  onRangeChange,
  push,
  onCategoryPick,
}: {
  state: ShopState;
  query: string;
  onQueryChange: (value: string) => void;
  onCommitQuery: () => void;
  range: [number, number];
  onRangeChange: (range: [number, number]) => void;
  push: (next: Partial<ShopState>) => void;
  /** 📱 Called after a category pick — the mobile sheet uses this to close itself. */
  onCategoryPick?: () => void;
}) {
  return (
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
            onChange={(event) => onQueryChange(event.target.value.slice(0, 60))}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              onCommitQuery();
            }}
            className={cn(
              "h-12 rounded-2xl bg-transparent ps-4 pe-11 text-sm font-bold",
              "border-navy/12 text-navy placeholder:text-navy/70",
              "dark:border-gold/30 dark:text-ivory dark:placeholder:text-wheat",
            )}
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
            onCategoryPick?.();
          }}
          className="flex flex-wrap justify-start gap-1.5"
          aria-label="دسته‌بندی"
        >
          {CATS.map((c) => (
            <ToggleGroupItem key={c} value={c} className={FILTER_CHIP}>
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
          aria-label="فصل"
        >
          {["همه", ...SEASONS].map((sn) => (
            <ToggleGroupItem key={sn} value={sn} className={FILTER_CHIP}>
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
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 transition",
                  on
                    ? "border-gold bg-gold-pale/70 dark:border-gold dark:bg-navy-mid"
                    : "border-navy/8 hover:border-gold/40 dark:border-gold/20 dark:bg-navy-mid/60 bg-white",
                )}
              >
                <span className="min-w-0">
                  <span className="text-navy dark:text-ivory block text-[13px] font-extrabold">
                    {label}
                  </span>
                  <span className="text-navy/70 dark:text-wheat block text-[10.5px] font-bold">
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
        <div
          className={cn(
            "rounded-2xl border p-4",
            "border-navy/8 bg-white",
            "dark:border-gold/20 dark:bg-navy-mid/60",
          )}
        >
          <div
            className={cn(
              "mb-4 flex items-center justify-between text-xs font-black",
              "text-navy",
              "dark:text-ivory",
            )}
          >
            <span className="bg-sand dark:bg-dusk-soft rounded-lg px-2.5 py-1">
              {formatToman(range[0])}
            </span>
            <span className="text-navy/70 dark:text-wheat text-[10px] font-bold">
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
            onValueChange={(v) => onRangeChange([v[0], v[1]] as [number, number])}
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
              <span className="block text-xs font-black">{p.label}</span>
              <span
                className={cn(
                  "mt-0.5 block text-[10px] font-bold",
                  "text-navy/70 group-data-[state=on]:text-gold-soft",
                  "dark:text-wheat dark:group-data-[state=on]:text-navy/70",
                )}
              >
                {p.hint}
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
