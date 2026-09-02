import Image from "next/image";
import Link from "next/link";
import { Pencil, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatToman, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import type { Product } from "@/types";

/** 🛍️ One catalog product — thumbnail, price, stock, edit/delete. */
export function AdminProductCard({
  product,
  onRemove,
}: {
  product: Product;
  onRemove: () => void;
}) {
  return (
    <article className={cn(adminGlassCard, "group")}>
      <div
        className={cn(
          "absolute inset-x-0 top-0 z-10 h-px opacity-0 transition-opacity group-hover:opacity-100",
          "via-gold/55 bg-linear-to-r from-transparent to-transparent",
        )}
      />
      <div className="flex min-w-0 gap-3 p-3.5">
        <div
          className={cn(
            "relative size-21 shrink-0 overflow-hidden rounded-2xl",
            "bg-sand",
            "dark:bg-navy-deep",
          )}
        >
          <Image
            src={product.img}
            alt={product.name}
            fill
            sizes="84px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span
            className={cn(
              "dark:ring-navy-deep absolute inset-e-1.5 bottom-1.5 size-2 rounded-full ring-2 ring-white",
              product.stock ? "bg-emerald-500" : "bg-rose",
            )}
          />
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-gold truncate text-[9px] font-black">
              {product.cat}
              {product.season ? ` · ${product.season}` : ""}
            </p>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-0.5 text-[9px] font-black",
                "text-navy/45",
                "dark:text-wheat",
              )}
            >
              <Star className="fill-gold text-gold size-3" />{" "}
              {toFaDigits(product.rate)}
            </span>
          </div>
          <h2
            className={cn(
              "mt-1 line-clamp-2 min-h-10 text-sm leading-5 font-black",
              "text-navy",
              "dark:text-ivory",
            )}
          >
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
            className={cn(
              "mt-1 text-[10px] font-bold",
              product.stock
                ? "text-emerald-600 dark:text-emerald-300"
                : "text-rose",
            )}
          >
            {product.stock
              ? `${toFaDigits(product.sold)} فروش ثبت‌شده`
              : "ناموجود در انبار"}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "flex gap-2 border-t px-3.5 py-2.5",
          "border-navy/6 bg-navy/1.5",
          "dark:border-gold/12 dark:bg-white/1.5",
        )}
      >
        <Button asChild variant="navy" className="h-9 flex-1 rounded-xl text-[10px]">
          <Link href={`/admin/products/${product.id}/edit`}>
            <Pencil className="size-3.5" /> ویرایش محصول
          </Link>
        </Button>
        <button
          type="button"
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-xl transition hover:scale-105",
            "bg-rose/10 text-rose hover:bg-rose/15",
          )}
          onClick={onRemove}
          aria-label={`حذف ${product.name}`}
          title="حذف محصول"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </article>
  );
}
