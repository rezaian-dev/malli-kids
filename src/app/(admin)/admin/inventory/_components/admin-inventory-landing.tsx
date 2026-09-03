"use client";

import { useMemo, useState, useTransition } from "react";
import { Boxes, PackageCheck, PackageX, ShoppingBag } from "lucide-react";

import { Pagination } from "@/components/ui/pagination";
import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminStatStrip,
  AdminPageHeader,
  AdminTable,
} from "@/components/admin";
import { usePagination } from "@/hooks/use-pagination";
import { CATS } from "@/lib/constants";
import { toFaDigits } from "@/lib/locale/fa";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { setProductStockAction } from "../../products/_lib/actions";
import { buildInventoryColumns } from "./inventory-columns";

const PER_PAGE = 7;
type StockFilter = "all" | "available" | "unavailable";
type SortFilter = "default" | "sold" | "price-desc" | "price-asc";

export function AdminInventoryLanding({ products }: { products: Product[] }) {
  const [, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [stock, setStock] = useState<StockFilter>("all");
  const [category, setCategory] = useState("همه");
  const [sort, setSort] = useState<SortFilter>("default");

  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    return products
      .filter((product) => {
        const matchesSearch =
          !term ||
          `${product.name} ${product.cat}`
            .toLocaleLowerCase("fa")
            .includes(term);
        const matchesCategory = category === "همه" || product.cat === category;
        const matchesStock =
          stock === "all" ||
          (stock === "available" ? product.stock : !product.stock);
        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        if (sort === "sold") return b.sold - a.sold;
        if (sort === "price-desc") return b.price - a.price;
        if (sort === "price-asc") return a.price - b.price;
        return a.id - b.id;
      });
  }, [category, products, q, sort, stock]);

  const low = products.filter((product) => !product.stock).length;
  const sales = products.reduce((sum, product) => sum + product.sold, 0);
  const activeFilters =
    Number(!!q.trim()) +
    Number(stock !== "all") +
    Number(category !== "همه") +
    Number(sort !== "default");
  const pg = usePagination(list, PER_PAGE, `${q}|${stock}|${category}|${sort}`);

  const cols = buildInventoryColumns({
    onToggleStock: (product, value) =>
      startTransition(async () => {
        const result = await setProductStockAction(product.id, value);
        if (!result.ok) toast.error(result.error);
      }),
  });

  return (
    <div>
      <AdminPageHeader
        kicker="INVENTORY"
        title="موجودی انبار"
        description="کنترل لحظه‌ای موجودی، شناسایی کمبودها و اولویت‌بندی تأمین کالاها."
      />

      <AdminStatStrip
        items={[
          {
            label: "کل مدل‌ها",
            value: products.length,
            Icon: Boxes,
            tone: "blue",
          },
          {
            label: "آماده فروش",
            value: products.length - low,
            Icon: PackageCheck,
            tone: "emerald",
          },
          { label: "ناموجود", value: low, Icon: PackageX, tone: "rose" },
          {
            label: "فروش ثبت‌شده",
            value: sales,
            Icon: ShoppingBag,
            tone: "gold",
          },
        ]}
      />

      {low > 0 ? (
        <div
          className={cn(
            "mb-4 flex items-start gap-3 rounded-2xl border px-4 py-3",
            "border-rose/18 bg-rose/7 text-rose",
          )}
        >
          <PackageX className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="text-xs font-black">
              {toFaDigits(low)} مدل نیازمند تأمین موجودی است
            </p>
            <p className="mt-0.5 text-[10px] font-bold opacity-70">
              محصول ناموجود در فروشگاه با وضعیت غیرفعال نمایش داده می‌شود.
            </p>
          </div>
        </div>
      ) : null}

      <AdminFilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="نام یا کد محصول…"
        resultCount={list.length}
        resultLabel="کالا"
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
            { value: "all", label: "همه کالاها" },
            {
              value: "available",
              label: "موجود",
              count: products.length - low,
            },
            { value: "unavailable", label: "ناموجود", count: low },
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
        minWidth="52rem"
      />
      {list.length > 0 ? <Pagination pg={pg} unit="کالا" /> : null}
    </div>
  );
}
