"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Boxes, PackageCheck, PackageX, ShoppingBag } from "lucide-react";

import { Pagination } from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";
import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminStatStrip,
  AdminPageHeader,
  useAdmin,
} from "@/components/admin";
import { AdminTable, type AdminCol } from "@/components/admin/admin-table";
import { usePagination } from "@/hooks/use-pagination";
import { CATS } from "@/lib/constants";
import { formatToman, toFaDigits } from "@/lib/format";
import type { Product } from "@/types";

const PER_PAGE = 7;
type StockFilter = "all" | "available" | "unavailable";
type SortFilter = "default" | "sold" | "price-desc" | "price-asc";

export default function AdminInventory() {
  const { db, upsertProduct } = useAdmin();
  const [q, setQ] = useState("");
  const [stock, setStock] = useState<StockFilter>("all");
  const [category, setCategory] = useState("همه");
  const [sort, setSort] = useState<SortFilter>("default");

  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    return db.products
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
  }, [category, db.products, q, sort, stock]);

  const low = db.products.filter((product) => !product.stock).length;
  const sales = db.products.reduce((sum, product) => sum + product.sold, 0);
  const activeFilters =
    Number(!!q.trim()) +
    Number(stock !== "all") +
    Number(category !== "همه") +
    Number(sort !== "default");
  const pg = usePagination(list, PER_PAGE, `${q}|${stock}|${category}|${sort}`);

  const cols: AdminCol<Product>[] = [
    {
      key: "name",
      title: "محصول",
      width: "2.1fr",
      render: (product) => (
        <div className="flex min-w-0 items-center gap-3">
          <span className="bg-sand dark:bg-navy-deep relative size-11 shrink-0 overflow-hidden rounded-xl">
            <Image
              src={product.img}
              alt=""
              fill
              sizes="44px"
              className="object-cover"
            />
          </span>
          <div className="min-w-0">
            <p className="truncate">{product.name}</p>
            <p className="text-navy/40 dark:text-wheat mt-0.5 text-[9px] font-bold">
              کد محصول #{toFaDigits(product.id)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "cat",
      title: "دسته‌بندی",
      width: "1.1fr",
      hideTablet: true,
      render: (product) => (
        <span className="text-navy/60 dark:text-wheat font-semibold">
          {product.cat}
        </span>
      ),
    },
    {
      key: "sold",
      title: "فروش کل",
      width: "5.5rem",
      align: "center",
      hideTablet: true,
      render: (product) => (
        <span className="inline-flex items-center gap-1">
          <ShoppingBag className="text-gold size-3" />{" "}
          {toFaDigits(product.sold)}
        </span>
      ),
    },
    {
      key: "price",
      title: "قیمت فروش",
      width: "8rem",
      align: "center",
      render: (product) => (
        <span className="text-gold-deep dark:text-gold-soft font-black whitespace-nowrap">
          {formatToman(product.price)}
        </span>
      ),
    },
    {
      key: "stock",
      title: "وضعیت انبار",
      width: "8.5rem",
      align: "center",
      render: (product) => (
        <label
          className="inline-flex cursor-pointer items-center gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <span
            className={`text-[10px] font-black ${product.stock ? "text-emerald-600 dark:text-emerald-300" : "text-rose"}`}
          >
            {product.stock ? "موجود" : "ناموجود"}
          </span>
          <Switch
            checked={product.stock}
            onCheckedChange={(value) =>
              upsertProduct({ ...product, stock: value })
            }
            aria-label={`موجودی ${product.name}`}
          />
        </label>
      ),
    },
  ];

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
            value: db.products.length,
            Icon: Boxes,
            tone: "blue",
          },
          {
            label: "آماده فروش",
            value: db.products.length - low,
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
        <div className="border-rose/18 bg-rose/7 text-rose mb-4 flex items-start gap-3 rounded-2xl border px-4 py-3">
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
              count: db.products.length - low,
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
