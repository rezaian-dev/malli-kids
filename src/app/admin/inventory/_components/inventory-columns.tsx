import Image from "next/image";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { AdminCol } from "@/components/admin";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { variantStockStatus } from "@/lib/shop/inventory";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";
import type { InventoryRow } from "../_lib/rows";

const STATUS_STYLE = {
  "in-stock": {
    label: "موجود",
    className: "text-emerald-600 dark:text-emerald-300",
    Icon: CheckCircle2,
  },
  "low-stock": {
    label: "موجودی کم",
    className: "text-amber-600 dark:text-amber-300",
    Icon: AlertTriangle,
  },
  "out-of-stock": {
    label: "ناموجود",
    className: "text-rose",
    Icon: XCircle,
  },
} as const;

/** 🧱 The inventory table column set — a plain builder so it can stay a
 *  Server-Component-clean file; the landing component owns the callbacks.
 *  Rows are per-variant (or per-product for legacy/unsized items) — see
 *  `buildInventoryRows` in `../_lib/rows`. */
export function buildInventoryColumns({
  selected,
  onToggleSelect,
  onToggleStock,
  onSetVariantStock,
}: {
  selected: Set<string>;
  onToggleSelect: (row: InventoryRow) => void;
  onToggleStock: (productId: number, value: boolean) => void;
  onSetVariantStock: (productId: number, size: string, stock: number) => void;
}): AdminCol<InventoryRow>[] {
  return [
    {
      key: "select",
      title: "",
      width: "2.5rem",
      render: (row) =>
        row.size ? (
          <input
            type="checkbox"
            checked={selected.has(row.id)}
            onChange={() => onToggleSelect(row)}
            onClick={(event) => event.stopPropagation()}
            aria-label={`انتخاب ${row.product.name} — سایز ${row.size}`}
            className="accent-gold size-4"
          />
        ) : null,
    },
    {
      key: "name",
      title: "محصول",
      width: "2fr",
      render: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <span className="bg-sand dark:bg-navy-deep relative size-11 shrink-0 overflow-hidden rounded-xl">
            <Image
              src={row.product.img}
              alt=""
              fill
              sizes="44px"
              className="object-cover"
            />
          </span>
          <div className="min-w-0">
            <p className="truncate">{row.product.name}</p>
            <p className="text-navy/70 dark:text-wheat mt-0.5 text-[9px] font-bold">
              کد محصول #{toFaDigits(row.product.id)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "variant",
      title: "سایز/رنگ",
      width: "7rem",
      align: "center",
      render: (row) =>
        row.size ? (
          <span className="text-navy dark:text-ivory font-black">
            {row.size}
            {row.color ? ` · ${row.color}` : ""}
          </span>
        ) : (
          <span className="text-navy/50 dark:text-wheat/50">—</span>
        ),
    },
    {
      key: "cat",
      title: "دسته‌بندی",
      width: "1.1fr",
      hideTablet: true,
      render: (row) => (
        <span className="text-navy/70 dark:text-wheat font-semibold">
          {row.product.cat}
        </span>
      ),
    },
    {
      key: "price",
      title: "قیمت فروش",
      width: "8rem",
      align: "center",
      hideTablet: true,
      render: (row) => (
        <span className="text-gold-deep dark:text-gold-soft font-black whitespace-nowrap">
          {formatToman(row.product.price)}
        </span>
      ),
    },
    {
      key: "stock",
      title: "وضعیت انبار",
      width: "12rem",
      align: "center",
      render: (row) => {
        if (!row.size) {
          return (
            <label
              className="inline-flex cursor-pointer items-center gap-2"
              onClick={(event) => event.stopPropagation()}
            >
              <span
                className={cn(
                  "text-[10px] font-black",
                  row.product.stock ? "text-emerald-600 dark:text-emerald-300" : "text-rose",
                )}
              >
                {row.product.stock ? "موجود" : "ناموجود"}
              </span>
              <Switch
                checked={row.product.stock}
                onCheckedChange={(value) => onToggleStock(row.product.id, value)}
                aria-label={`موجودی ${row.product.name}`}
              />
            </label>
          );
        }

        const status = variantStockStatus(row.stock ?? 0);
        const { label, className, Icon } = STATUS_STYLE[status];
        return (
          <div
            className="flex items-center justify-center gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            <Input
              type="number"
              min={0}
              defaultValue={row.stock}
              key={row.stock}
              onBlur={(event) => {
                const next = Number(event.target.value);
                if (Number.isInteger(next) && next >= 0 && next !== row.stock) {
                  onSetVariantStock(row.product.id, row.size!, next);
                }
              }}
              className="h-9 w-16 rounded-lg px-2 text-center text-xs"
            />
            <span className={cn("inline-flex items-center gap-1 text-[10px] font-black", className)}>
              <Icon className="size-3.5" /> {label}
            </span>
          </div>
        );
      },
    },
  ];
}
