import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import type { AdminCol } from "@/components/admin";
import { Switch } from "@/components/ui/switch";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

/** 🧱 The inventory table column set — a plain builder so it can stay a
 *  Server-Component-clean file; `page.tsx` owns the stock-toggle callback. */
export function buildInventoryColumns({
  onToggleStock,
}: {
  onToggleStock: (product: Product, value: boolean) => void;
}): AdminCol<Product>[] {
  return [
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
            <p className="text-navy/70 dark:text-wheat mt-0.5 text-[9px] font-bold">
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
        <span className="text-navy/70 dark:text-wheat font-semibold">
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
          <ShoppingBag className="text-gold size-3" /> {toFaDigits(product.sold)}
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
            className={cn(
              "text-[10px] font-black",
              product.stock
                ? "text-emerald-600 dark:text-emerald-300"
                : "text-rose",
            )}
          >
            {product.stock ? "موجود" : "ناموجود"}
          </span>
          <Switch
            checked={product.stock}
            onCheckedChange={(value) => onToggleStock(product, value)}
            aria-label={`موجودی ${product.name}`}
          />
        </label>
      ),
    },
  ];
}
