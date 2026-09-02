"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BadgePercent, Boxes, PackageCheck, PackageX, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminStatStrip,
  AdminPageHeader,
  useAdmin,
} from "@/components/admin";
import { usePagination } from "@/hooks/use-pagination";
import { CATS, SEASONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import { AdminProductCard } from "./_components/admin-product-card";

const PER_PAGE = 6;
type StockFilter = "all" | "available" | "unavailable";
type SortFilter = "newest" | "popular" | "price-desc" | "price-asc";

export default function AdminProducts() {
  const { db, removeProduct } = useAdmin();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("همه");
  const [season, setSeason] = useState("همه");
  const [stock, setStock] = useState<StockFilter>("all");
  const [sort, setSort] = useState<SortFilter>("newest");

  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    return db.products
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
  }, [cat, db.products, q, season, sort, stock]);

  const resetKey = `${q}|${cat}|${season}|${stock}|${sort}`;
  const pg = usePagination(list, PER_PAGE, resetKey);
  const activeFilters =
    Number(!!q.trim()) +
    Number(cat !== "همه") +
    Number(season !== "همه") +
    Number(stock !== "all") +
    Number(sort !== "newest");
  const available = db.products.filter((product) => product.stock).length;
  const discounted = db.products.filter(
    (product) => product.old || product.disc,
  ).length;

  function resetFilters() {
    setQ("");
    setCat("همه");
    setSeason("همه");
    setStock("all");
    setSort("newest");
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
            value: db.products.length,
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
            value: db.products.length - available,
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
                ? db.products.length
                : db.products.filter((product) => product.cat === item).length,
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
              count: db.products.length - available,
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

      {list.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {pg.pageItems.map((product) => (
            <AdminProductCard
              key={product.id}
              product={product}
              onRemove={() => removeProduct(product.id)}
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
