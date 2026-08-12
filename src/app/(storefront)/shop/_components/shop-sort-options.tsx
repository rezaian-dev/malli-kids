import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Check,
  Sparkles,
  Star,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

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

/** 🔀 Shared sort UI for the desktop popover and the mobile sheet. */
export function ShopSortOptions({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (sort: string) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(k) => k && onValueChange(k)}
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
}
