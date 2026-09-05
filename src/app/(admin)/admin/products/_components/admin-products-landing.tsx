"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { BadgePercent, Boxes, PackageCheck, PackageX, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  AdminConfirmDialog,
  AdminFilterBar,
  AdminFilterSelect,
  AdminStatStrip,
  AdminPageHeader,
} from "@/components/admin";
import { usePagination } from "@/hooks/use-pagination";
import { CATS, SEASONS } from "@/lib/constants";
import { toFaDigits } from "@/lib/locale/fa";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import type { Product } from "@/types";
import {
  bulkRemoveProductsAction,
  bulkSetProductFeaturedAction,
  bulkSetProductVisibilityAction,
  removeProductAction,
} from "../_lib/actions";
import { AdminProductCard } from "./admin-product-card";

const PER_PAGE = 6;
type StockFilter = "all" | "available" | "unavailable";
type SortFilter = "newest" | "popular" | "price-desc" | "price-asc";

export function AdminProductsLanding({ products }: { products: Product[] }) {
  const [, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("همه");
  const [season, setSeason] = useState("همه");
  const [stock, setStock] = useState<StockFilter>("all");
  const [sort, setSort] = useState<SortFilter>("newest");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    return products
      .filter((product) => {
        const matchesSearch =
          !term ||
          `${product.name} ${product.cat} ${product.season ?? ""}`
            .toLocaleLowerCase("fa")
            .includes(term);
        const matchesCategory = cat === "همه" || product.cat === cat;
        const matchesSeason = season === "همه" || product.season === season;
        const matchesStock =
          stock === "all" ||
          (stock === "available" ? product.stock : !product.stock);
        return (
          matchesSearch && matchesCategory && matchesSeason && matchesStock
        );
      })
      .sort((a, b) => {
        if (sort === "popular") return b.sold - a.sold;
        if (sort === "price-desc") return b.price - a.price;
        if (sort === "price-asc") return a.price - b.price;
        return b.id - a.id;
      });
  }, [cat, products, q, season, sort, stock]);

  const resetKey = `${q}|${cat}|${season}|${stock}|${sort}`;
  const pg = usePagination(list, PER_PAGE, resetKey);
  const activeFilters =
    Number(!!q.trim()) +
    Number(cat !== "همه") +
    Number(season !== "همه") +
    Number(stock !== "all") +
    Number(sort !== "newest");
  const available = products.filter((product) => product.stock).length;
  const discounted = products.filter(
    (product) => product.old || product.disc,
  ).length;

  function resetFilters() {
    setQ("");
    setCat("همه");
    setSeason("همه");
    setStock("all");
    setSort("newest");
  }

  function toggleSelect(id: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function runBulk(action: (ids: number[]) => Promise<{ ok: boolean; error?: string }>, message: string) {
    const ids = Array.from(selected);
    startTransition(async () => {
      const result = await action(ids);
      if (!result.ok) {
        toast.error(result.error ?? "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.");
        return;
      }
      toast.success(message);
      setSelected(new Set());
    });
  }

  return (
    <div>
      <AdminPageHeader
        kicker="CATALOG"
        title="مدیریت محصولات"
        description="مدیریت حرفه‌ای کاتالوگ، قیمت‌گذاری، موجودی و وضعیت انتشار محصولات."
        action={
          <Button asChild variant="navy" className="h-11 rounded-xl px-5">
            <Link href="/admin/products/new">
              <Plus className="size-4" /> محصول جدید
            </Link>
          </Button>
        }
      />

      <AdminStatStrip
        items={[
          {
            label: "کل محصولات",
            value: products.length,
            Icon: Boxes,
            tone: "blue",
          },
          {
            label: "موجود",
            value: available,
            Icon: PackageCheck,
            tone: "emerald",
          },
          {
            label: "ناموجود",
            value: products.length - available,
            Icon: PackageX,
            tone: "rose",
          },
          {
            label: "دارای تخفیف",
            value: discounted,
            Icon: BadgePercent,
            tone: "gold",
          },
        ]}
      />

      <AdminFilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="نام مدل یا دسته‌بندی…"
        resultCount={list.length}
        resultLabel="مدل"
        activeCount={activeFilters}
        onReset={resetFilters}
      >
        <AdminFilterSelect
          label="دسته‌بندی"
          value={cat}
          onValueChange={setCat}
          options={CATS.map((item) => ({
            value: item,
            label: item === "همه" ? "همه دسته‌ها" : item,
            count:
              item === "همه"
                ? products.length
                : products.filter((product) => product.cat === item).length,
          }))}
        />
        <AdminFilterSelect
          label="فصل"
          value={season}
          onValueChange={setSeason}
          options={[
            { value: "همه", label: "همه فصل‌ها" },
            ...SEASONS.map((item) => ({ value: item, label: item })),
          ]}
        />
        <AdminFilterSelect
          label="موجودی"
          value={stock}
          onValueChange={(value) => setStock(value as StockFilter)}
          options={[
            { value: "all", label: "همه وضعیت‌ها" },
            { value: "available", label: "فقط موجود", count: available },
            {
              value: "unavailable",
              label: "فقط ناموجود",
              count: products.length - available,
            },
          ]}
        />
        <AdminFilterSelect
          label="مرتب‌سازی"
          value={sort}
          onValueChange={(value) => setSort(value as SortFilter)}
          options={[
            { value: "newest", label: "جدیدترین" },
            { value: "popular", label: "پرفروش‌ترین" },
            { value: "price-desc", label: "بیشترین قیمت" },
            { value: "price-asc", label: "کمترین قیمت" },
          ]}
        />
      </AdminFilterBar>

      {selected.size > 0 ? (
        <div
          className={cn(
            "mb-4 flex flex-wrap items-center gap-2 rounded-2xl border px-4 py-3",
            "border-gold/25 bg-gold/8",
          )}
        >
          <p className="text-navy dark:text-ivory text-xs font-black">
            {toFaDigits(selected.size)} محصول انتخاب‌شده
          </p>
          <Button
            variant="outline"
            className="h-9 rounded-xl px-3 text-[11px]"
            onClick={() =>
              runBulk(
                (ids) => bulkSetProductVisibilityAction(ids, true),
                "محصولات نمایش داده شدند",
              )
            }
          >
            نمایش گروهی
          </Button>
          <Button
            variant="outline"
            className="h-9 rounded-xl px-3 text-[11px]"
            onClick={() =>
              runBulk(
                (ids) => bulkSetProductVisibilityAction(ids, false),
                "محصولات پنهان شدند",
              )
            }
          >
            پنهان‌سازی گروهی
          </Button>
          <Button
            variant="outline"
            className="h-9 rounded-xl px-3 text-[11px]"
            onClick={() =>
              runBulk(
                (ids) => bulkSetProductFeaturedAction(ids, true),
                "محصولات ویژه شدند",
              )
            }
          >
            ویژه‌کردن گروهی
          </Button>
          <AdminConfirmDialog
            title={`حذف ${toFaDigits(selected.size)} محصول؟`}
            description="این محصولات برای همیشه از کاتالوگ حذف می‌شوند. این عمل قابل بازگشت نیست."
            successMessage="محصولات حذف شدند"
            onConfirm={() => bulkRemoveProductsAction(Array.from(selected))}
            trigger={
              <button
                type="button"
                className="bg-rose/10 text-rose hover:bg-rose/15 h-9 rounded-xl px-3 text-[11px] font-black transition"
              >
                حذف گروهی
              </button>
            }
          />
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-navy/70 dark:text-wheat text-[11px] font-bold underline"
          >
            لغو انتخاب
          </button>
        </div>
      ) : null}

      {list.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {pg.pageItems.map((product) => (
            <AdminProductCard
              key={product.id}
              product={product}
              selected={selected.has(product.id)}
              onToggleSelect={() => toggleSelect(product.id)}
              onRemove={() => removeProductAction(product.id)}
            />
          ))}
        </div>
      ) : (
        <div className={cn(adminGlassCard, "px-5 py-12 text-center")}>
          <PackageX className="text-gold mx-auto size-10" />
          <p className="text-navy dark:text-ivory mt-3 text-sm font-black">
            محصولی مطابق فیلترها پیدا نشد
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="text-gold mt-2 text-xs font-black"
          >
            نمایش همه محصولات
          </button>
        </div>
      )}

      {list.length > 0 ? <Pagination pg={pg} unit="مدل" /> : null}
    </div>
  );
}
