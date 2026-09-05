import Image from "next/image";
import Link from "next/link";
import { Eye } from "lucide-react";
import type { ReactNode } from "react";
import type { Product } from "@/types";
import { AddToCartButton } from "./add-to-cart-button";
import { DiscountBadge } from "./price-tag";
import { FavButton } from "./fav-button";
import { CART, VIEW } from "./card-styles";
import { cn } from "@/lib/utils";

const LIST_SIZES = "104px";

/** 📋 The compact horizontal card used in the shop's list view. */
export function ProductCardList({
  p,
  href,
  out,
  sold,
  price,
  imageProps,
}: {
  p: Product;
  href: string;
  out: boolean;
  sold: ReactNode;
  price: ReactNode;
  imageProps: {
    loading?: "eager";
    fetchPriority?: "high";
  };
}) {
  return (
    <article
      className={cn(
        "group flex min-w-0 flex-row overflow-hidden rounded-[20px] border transition-all duration-500 ease-out",
        "border-navy/10 hover:border-gold/55 bg-white/94 hover:-translate-y-1 hover:shadow-[0_18px_36px_-16px_rgba(14,42,71,.28)]",
        "dark:border-gold-soft/35 dark:bg-slate/60",
      )}
    >
      <Link
        href={href}
        prefetch={false}
        className="bg-sand relative block h-auto min-h-30 w-26 shrink-0 overflow-hidden"
      >
        <Image
          src={p.img}
          alt={p.name}
          width={600}
          height={800}
          sizes={LIST_SIZES}
          {...imageProps}
          className={cn(
            "absolute inset-0 size-full max-w-none object-cover transition-transform duration-700 ease-out group-hover:scale-110",
            out && "opacity-75 grayscale",
          )}
        />
        <FavButton
          id={p.id}
          name={p.name}
          className="absolute top-1.5 right-1.5 size-8 shadow"
        />
        {/* 🏷️ Top-left: the fav button already owns top-right here. */}
        {!out ? (
          <DiscountBadge
            price={p.price}
            old={p.old}
            className="absolute top-1.5 left-1.5 z-2"
          />
        ) : null}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
        <div className="flex justify-between gap-2">
          <div className="min-w-0">
            <p className="text-navy/70 dark:text-khaki m-0 text-[11px]">
              {p.cat}
            </p>
            <h3 className="text-navy dark:text-ivory m-0 text-sm leading-snug font-black">
              <Link href={href} prefetch={false} className="text-inherit no-underline">
                {p.name}
              </Link>
            </h3>
          </div>
        </div>
        {sold}
        <div className="mt-auto flex flex-wrap items-center gap-2">
          {price}
          <div className="ms-auto flex gap-1.5">
            <Link
              href={href}
              prefetch={false}
              className={cn(VIEW, "h-8 px-2.5 text-[11px]")}
            >
              <Eye width={14} height={14} /> مشاهده
            </Link>
            <AddToCartButton
              out={out}
              id={p.id}
              className={cn(CART, "h-8 px-2.5 text-[11px]")}
            >
              {out ? "خبرم کن" : "سبد"}
            </AddToCartButton>
          </div>
        </div>
      </div>
    </article>
  );
}
