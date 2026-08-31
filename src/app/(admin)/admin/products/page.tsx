"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BadgePercent,
  Boxes,
  PackageCheck,
  PackageX,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";

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
import { formatToman, toFaDigits } from "@/lib/format";

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
        onReset={() => {
          setQ("");
          setCat("همه");
          setSeason("همه");
          setStock("all");
          setSort("newest");
        }}
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
          {pg.pageItems.map((product, index) => (
            <article
              key={product.id}
              className="border-navy/9 bg-paper/94 hover:border-gold/40 dark:border-gold-soft/16 dark:hover:border-gold-soft/30 group relative overflow-hidden rounded-[22px] border shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:shadow-[0_24px_52px_-34px_rgba(14,42,71,0.44)] max-[639px]:rounded-[19px] dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)] dark:hover:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.88),0_0_34px_rgba(193,147,87,0.035)]"
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <div className="via-gold/55 absolute inset-x-0 top-0 z-10 h-px bg-linear-to-r from-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="flex min-w-0 gap-3 p-3.5">
                <div className="bg-sand dark:bg-navy-deep relative size-21 shrink-0 overflow-hidden rounded-2xl">
                  <Image
                    src={product.img}
                    alt={product.name}
                    fill
                    sizes="84px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    className={`dark:ring-navy-deep absolute inset-e-1.5 bottom-1.5 size-2 rounded-full ring-2 ring-white ${product.stock ? "bg-emerald-500" : "bg-rose"}`}
                  />
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-gold truncate text-[9px] font-black">
                      {product.cat}
                      {product.season ? ` · ${product.season}` : ""}
                    </p>
                    <span className="text-navy/45 dark:text-wheat inline-flex shrink-0 items-center gap-0.5 text-[9px] font-black">
                      <Star className="fill-gold text-gold size-3" />{" "}
                      {toFaDigits(product.rate)}
                    </span>
                  </div>
                  <h2 className="text-navy dark:text-ivory mt-1 line-clamp-2 min-h-10 text-sm leading-5 font-black">
                    {product.name}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
                    <p className="text-navy dark:text-ivory text-xs font-black">
                      {formatToman(product.price)}{" "}
                      <span className="text-navy/45 dark:text-wheat text-[9px]">
                        تومان
                      </span>
                    </p>
                    {product.old ? (
                      <del className="text-navy/35 dark:text-wheat/50 text-[9px]">
                        {formatToman(product.old)}
                      </del>
                    ) : null}
                  </div>
                  <p
                    className={`mt-1 text-[10px] font-bold ${product.stock ? "text-emerald-600 dark:text-emerald-300" : "text-rose"}`}
                  >
                    {product.stock
                      ? `${toFaDigits(product.sold)} فروش ثبت‌شده`
                      : "ناموجود در انبار"}
                  </p>
                </div>
              </div>

              <div className="border-navy/6 bg-navy/1.5 dark:border-gold/12 flex gap-2 border-t px-3.5 py-2.5 dark:bg-white/1.5">
                <Button
                  asChild
                  variant="navy"
                  className="h-9 flex-1 rounded-xl text-[10px]"
                >
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <Pencil className="size-3.5" /> ویرایش محصول
                  </Link>
                </Button>
                <button
                  type="button"
                  className="bg-rose/10 text-rose hover:bg-rose/15 grid size-9 shrink-0 place-items-center rounded-xl transition hover:scale-105"
                  onClick={() => removeProduct(product.id)}
                  aria-label={`حذف ${product.name}`}
                  title="حذف محصول"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="border-navy/9 bg-paper/94 hover:border-gold/40 dark:border-gold-soft/16 dark:hover:border-gold-soft/30 rounded-[22px] border px-5 py-12 text-center shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:shadow-[0_24px_52px_-34px_rgba(14,42,71,0.44)] max-[639px]:rounded-[19px] dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)] dark:hover:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.88),0_0_34px_rgba(193,147,87,0.035)]">
          <PackageX className="text-gold mx-auto size-10" />
          <p className="text-navy dark:text-ivory mt-3 text-sm font-black">
            محصولی مطابق فیلترها پیدا نشد
          </p>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setCat("همه");
              setSeason("همه");
              setStock("all");
              setSort("newest");
            }}
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
