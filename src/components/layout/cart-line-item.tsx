"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Trash2 } from "lucide-react";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { pdpHref } from "@/lib/data/products";
import { SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { QtyStepper } from "@/components/shared/qty-stepper";
import { CheckoutMount } from "@/components/product";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

/** 🛍️ One cart row — thumbnail, qty stepper, and a quick "ثبت سفارش" that
 *  opens the same single-item checkout the product page uses, scoped to
 *  this line — the cart itself still doesn't check out multiple items at
 *  once, but a saved line is never a dead end anymore. */
export function CartLineItem({
  item,
  product,
  unitPrice,
  showStrike,
  onQtyChange,
  onRemove,
}: {
  item: { id: number; size: string; qty: number };
  product: Product;
  unitPrice: number;
  showStrike: boolean;
  onQtyChange: (qty: number) => void;
  onRemove: () => void;
}) {
  const [checkout, setCheckout] = useState(false);

  return (
    <div
      className={cn(
        "group relative flex gap-3 p-2.5 sm:p-3",
        "border-navy/8 hover:border-gold/40 rounded-2xl border bg-white shadow-[0_10px_24px_-18px_rgba(14,42,71,.45)] transition-colors",
        "dark:border-gold/20 dark:bg-navy-mid/70 dark:hover:border-gold/50",
      )}
    >
      <SheetClose asChild>
        <Link
          href={pdpHref(product.id)}
          className={cn(
            "relative block size-16 shrink-0 overflow-hidden sm:size-20",
            "border-navy/8 bg-sand rounded-xl border",
            "dark:border-gold/20 dark:bg-dusk",
          )}
        >
          <Image
            src={product.img}
            alt={product.name}
            width={80}
            height={80}
            className={cn(
              "size-full object-cover",
              "transition-transform duration-500 group-hover:scale-108",
            )}
          />
        </Link>
      </SheetClose>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <SheetClose asChild>
            <Link
              href={pdpHref(product.id)}
              className={cn(
                "line-clamp-1",
                "text-navy hover:text-gold text-[13px] font-black sm:text-sm",
                "dark:text-ivory dark:hover:text-gold-light",
              )}
            >
              {product.name}
            </Link>
          </SheetClose>
          <button
            type="button"
            aria-label={`حذفِ ${product.name} سایز ${item.size}`}
            onClick={onRemove}
            className={cn(
              "grid size-7 shrink-0 place-items-center",
              "text-navy/70 hover:bg-rose/10 hover:text-rose rounded-full transition-all motion-safe:hover:scale-110 motion-safe:active:scale-90",
              "dark:text-wheat/70 dark:hover:bg-rose/15 dark:hover:text-rose",
            )}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>

        <div
          className={cn(
            "mt-1 flex flex-wrap items-center gap-1.5",
            "text-navy/70 text-[10px] font-bold",
            "dark:text-wheat/70",
          )}
        >
          <span
            className={cn(
              "px-2 py-0.5",
              "border-navy/12 bg-sand rounded-full border",
              "dark:border-gold/25 dark:bg-dusk-soft",
            )}
          >
            سایز {item.size}
          </span>
          <span className="tabular-nums">
            {formatToman(unitPrice)} تومان
            {showStrike ? (
              <s className="text-silver ms-1.5 text-[10px]">
                {formatToman(product.price)}
              </s>
            ) : null}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <QtyStepper qty={item.qty} onChange={onQtyChange} size="sm" />
          <span
            className={cn(
              "text-gold-deep text-[13px] font-black tabular-nums",
              "dark:text-gold-light",
            )}
          >
            {formatToman(unitPrice * item.qty)}{" "}
            <span className="text-navy/70 dark:text-wheat/70 text-[10px] font-bold">
              تومان
            </span>
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "mt-2 h-8 w-full gap-1.5 rounded-xl text-[11px] font-black",
            "border-gold/50 text-gold-deep",
            "dark:text-gold-soft",
          )}
          onClick={() => setCheckout(true)}
        >
          <BadgeCheck className="size-3.5" /> ثبت سفارش این مورد
        </Button>
      </div>

      <CheckoutMount
        open={checkout}
        onOpenChange={setCheckout}
        product={product}
        size={item.size}
        qty={item.qty}
        unit={unitPrice}
      />
    </div>
  );
}
