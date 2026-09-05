"use client";

import { useMemo, useState, useTransition } from "react";
import { Boxes, PackageCheck, PackageX, ShoppingBag } from "lucide-react";

import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminStatStrip,
  AdminPageHeader,
  AdminTable,
} from "@/components/admin";
import { usePagination } from "@/hooks/use-pagination";
import { CATS } from "@/lib/constants";
import { variantStockStatus, type VariantStockStatus } from "@/lib/shop/inventory";
import { toFaDigits } from "@/lib/locale/fa";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import {
  bulkSetVariantStockAction,
  setProductStockAction,
  setVariantStockAction,
} from "../../products/_lib/actions";
import { buildInventoryColumns } from "./inventory-columns";
import { buildInventoryRows, type InventoryRow } from "../_lib/rows";

const PER_PAGE = 8;
type StockFilter = "all" | "in-stock" | "low-stock" | "out-of-stock";
type SortFilter = "default" | "sold" | "price-desc" | "price-asc";

function rowStatus(row: InventoryRow): VariantStockStatus {
  if (row.size) return variantStockStatus(row.stock ?? 0);
  return row.product.stock ? "in-stock" : "out-of-stock";
}

export function AdminInventoryLanding({ products }: { products: Product[] }) {
  const [, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [stock, setStock] = useState<StockFilter>("all");
  const [category, setCategory] = useState("همه");
  const [sort, setSort] = useState<SortFilter>("default");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkValue, setBulkValue] = useState("0");

  const rows = useMemo(() => buildInventoryRows(products), [products]);

  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    return rows
      .filter((row) => {
        const matchesSearch =
          !term ||
          `${row.product.name} ${row.product.cat}`
            .toLocaleLowerCase("fa")
            .includes(term);
        const matchesCategory = category === "همه" || row.product.cat === category;
        const matchesStock = stock === "all" || rowStatus(row) === stock;
        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        if (sort === "sold") return b.product.sold - a.product.sold;
        if (sort === "price-desc") return b.product.price - a.product.price;
        if (sort === "price-asc") return a.product.price - b.product.price;
        return a.product.id - b.product.id;
      });
  }, [category, rows, q, sort, stock]);

  const outOfStock = rows.filter((row) => rowStatus(row) === "out-of-stock").length;
  const lowStock = rows.filter((row) => rowStatus(row) === "low-stock").length;
  const sales = products.reduce((sum, product) => sum + product.sold, 0);
  const activeFilters =
    Number(!!q.trim()) +
    Number(stock !== "all") +
    Number(category !== "همه") +
    Number(sort !== "default");
  const pg = usePagination(list, PER_PAGE, `${q}|${stock}|${category}|${sort}`);

  function toggleSelect(row: InventoryRow) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(row.id)) next.delete(row.id);
      else next.add(row.id);
      return next;
    });
  }

  function applyBulkStock() {
    const value = Number(bulkValue);
    if (!Number.isInteger(value) || value < 0) {
      toast.error("موجودی باید عدد صحیح و غیرمنفی باشد");
      return;
    }
    const updates = rows
      .filter((row) => selected.has(row.id) && row.size)
      .map((row) => ({ id: row.product.id, size: row.size!, stock: value }));

    startTransition(async () => {
      const result = await bulkSetVariantStockAction(updates);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`موجودی ${toFaDigits(updates.length)} مورد به‌روزرسانی شد`);
      setSelected(new Set());
    });
  }

  const cols = buildInventoryColumns({
    selected,
    onToggleSelect: toggleSelect,
    onToggleStock: (productId, value) =>
      startTransition(async () => {
        const result = await setProductStockAction(productId, value);
        if (!result.ok) toast.error(result.error);
      }),
    onSetVariantStock: (productId, size, newStock) =>
      startTransition(async () => {
        const result = await setVariantStockAction(productId, size, newStock);
        if (!result.ok) toast.error(result.error);
      }),
  });

  return (
    <div>
      <AdminPageHeader
        kicker="INVENTORY"
        title="موجودی انبار"
        description="کنترل لحظه‌ای موجودی هر سایز، شناسایی کمبودها و اولویت‌بندی تأمین کالاها."
      />

      <AdminStatStrip
        items={[
          {
            label: "کل ردیف‌ها",
            value: rows.length,
            Icon: Boxes,
            tone: "blue",
          },
          {
            label: "آماده فروش",
            value: rows.length - outOfStock - lowStock,
            Icon: PackageCheck,
            tone: "emerald",
          },
          { label: "موجودی کم", value: lowStock, Icon: PackageX, tone: "gold" },
          { label: "ناموجود", value: outOfStock, Icon: PackageX, tone: "rose" },
          {
            label: "فروش ثبت‌شده",
            value: sales,
            Icon: ShoppingBag,
            tone: "gold",
          },
        ]}
      />

      {outOfStock + lowStock > 0 ? (
        <div
          className={cn(
            "mb-4 flex items-start gap-3 rounded-2xl border px-4 py-3",
            "border-rose/18 bg-rose/7 text-rose",
          )}
        >
          <PackageX className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="text-xs font-black">
              {toFaDigits(outOfStock + lowStock)} ردیف نیازمند تأمین موجودی است
            </p>
            <p className="mt-0.5 text-[10px] font-bold opacity-70">
              {toFaDigits(outOfStock)} ناموجود · {toFaDigits(lowStock)} موجودی کم
            </p>
          </div>
        </div>
      ) : null}

      {selected.size > 0 ? (
        <div
          className={cn(
            "mb-4 flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3",
            "border-gold/25 bg-gold/8",
          )}
        >
          <p className="text-navy dark:text-ivory text-xs font-black">
            {toFaDigits(selected.size)} ردیف انتخاب‌شده
          </p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              value={bulkValue}
              onChange={(event) => setBulkValue(event.target.value)}
              className="h-9 w-20 rounded-lg px-2 text-center text-xs"
            />
            <Button
              type="button"
              variant="navy"
              className="h-9 rounded-xl px-3 text-[11px]"
              onClick={applyBulkStock}
            >
              اعمال موجودی گروهی
            </Button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-navy/70 dark:text-wheat text-[11px] font-bold underline"
            >
              لغو انتخاب
            </button>
          </div>
        </div>
      ) : null}

      <AdminFilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="نام یا کد محصول…"
        resultCount={list.length}
        resultLabel="ردیف"
        activeCount={activeFilters}
        onReset={() => {
          setQ("");
          setStock("all");
          setCategory("همه");
          setSort("default");
        }}
      >
        <AdminFilterSelect
          label="وضعیت موجودی"
          value={stock}
          onValueChange={(value) => setStock(value as StockFilter)}
          options={[
            { value: "all", label: "همه وضعیت‌ها" },
            { value: "in-stock", label: "موجود" },
            { value: "low-stock", label: "موجودی کم", count: lowStock },
            { value: "out-of-stock", label: "ناموجود", count: outOfStock },
          ]}
        />
        <AdminFilterSelect
          label="دسته‌بندی"
          value={category}
          onValueChange={setCategory}
          options={CATS.map((item) => ({
            value: item,
            label: item === "همه" ? "همه دسته‌ها" : item,
          }))}
        />
        <AdminFilterSelect
          label="مرتب‌سازی"
          value={sort}
          onValueChange={(value) => setSort(value as SortFilter)}
          options={[
            { value: "default", label: "ترتیب پیش‌فرض" },
            { value: "sold", label: "پرفروش‌ترین" },
            { value: "price-desc", label: "بیشترین قیمت" },
            { value: "price-asc", label: "کمترین قیمت" },
          ]}
        />
      </AdminFilterBar>

      <AdminTable
        cols={cols}
        rows={pg.pageItems}
        empty="کالایی مطابق فیلترهای انبار پیدا نشد."
        minWidth="58rem"
      />
      {list.length > 0 ? <Pagination pg={pg} unit="ردیف" /> : null}
    </div>
  );
}
