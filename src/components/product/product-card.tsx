import Image from "next/image";
import Link from "next/link";
import { Bell, Eye, PackageX, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/types";
import { formatToman, toFaDigits } from "@/lib/format";
import { pdpHref } from "@/lib/data/products";
import { AddToCartButton } from "./add-to-cart-button";
import { FavButton } from "./fav-button";
import { PriceTag } from "./price-tag";
import { cn } from "@/lib/utils";

const BADGE: Record<string, string> = {
  پرفروش: "bg-navy text-gold-light",
  جدید: "bg-gold text-navy-deep",
  "منتخب مادران": "bg-white text-ink",
};

const VIEW = cn(
  "inline-flex items-center justify-center gap-1.5 rounded-xl font-black no-underline transition-all duration-300 hover:-translate-y-0.5",
  "border-2 border-ink bg-white text-ink hover:bg-ink hover:text-white",
  "dark:border-ivory dark:bg-transparent dark:text-ivory dark:hover:bg-ivory dark:hover:text-navy-deep",
);
const CART = cn(
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border-0 font-extrabold transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110",
  "bg-navy text-ivory",
  "dark:bg-gold dark:text-navy-deep",
);
const GRID_SIZES =
  "(max-width: 479px) calc((100vw - 3.75rem) / 2), (max-width: 639px) calc((100vw - 5.5rem) / 2), (max-width: 1023px) calc((100vw - 5.5rem) / 2), (max-width: 1535px) 33vw, 18rem";
const LIST_SIZES = "104px";

// 🪶 Server-first card with tiny client actions.
export function ProductCard({
  p,
  view,
  aboveFold = false,
}: {
  p: Product;
  view: "grid" | "list";
  aboveFold?: boolean;
}) {
  const href = pdpHref(p.id);
  const out = !p.stock;
  const badge = p.badge ? BADGE[p.badge] || "bg-navy text-gold-light" : null;
  const imageProps = {
    loading: aboveFold ? ("eager" as const) : undefined,
    fetchPriority: aboveFold ? ("high" as const) : undefined,
  };

  const sold = (
    // ♿ brown-mid, not gold: gold-on-white card text is ~2.2:1, below the
    // 4.5:1 minimum. Dark mode (gold-on-slate) already passes, untouched.
    <p
      className={cn(
        "m-0 mt-1.5 inline-flex flex-row items-center gap-1.5 text-[11px] leading-none font-extrabold",
        "text-brown-mid",
        "dark:text-gold-soft",
      )}
    >
      <ShoppingBag className="block size-3.25 shrink-0" />
      {toFaDigits(p.sold)} فروش
    </p>
  );

  const price = out ? (
    <span className="text-rose text-xs font-extrabold">ناموجود</span>
  ) : (
    <PriceTag price={p.price} />
  );

  if (view === "list") {
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
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
          <div className="flex justify-between gap-2">
            <div className="min-w-0">
              <p className="text-navy/70 dark:text-khaki m-0 text-[11px]">
                {p.cat}
              </p>
              <h3 className="text-navy dark:text-ivory m-0 text-sm leading-snug font-black">
                <Link
                  href={href}
                  prefetch={false}
                  className="text-inherit no-underline"
                >
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

  return (
    <article
      className={cn(
        "group @container flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border transition-all duration-500 ease-out",
        "border-navy/10 hover:border-gold/55 bg-white/94 shadow-[0_10px_28px_-18px_rgba(14,42,71,.22)] hover:-translate-y-2 hover:shadow-[0_26px_48px_-18px_rgba(14,42,71,.32)]",
        "dark:border-gold-soft/35 dark:bg-slate/60 dark:shadow-none",
      )}
    >
      <div className="bg-sand relative w-full shrink-0 overflow-hidden pt-[125%]">
        <Image
          src={p.img}
          alt={p.name}
          width={600}
          height={800}
          sizes={GRID_SIZES}
          {...imageProps}
          className={cn(
            "absolute inset-0 size-full max-w-none object-cover transition-transform duration-700 ease-out",
            out ? "opacity-75 grayscale" : "group-hover:scale-110",
          )}
        />
        {badge ? (
          <span
            className={cn(
              "absolute top-2.5 right-2.5 z-2 rounded-full px-2.5 py-1 text-[10px] font-black whitespace-nowrap",
              badge,
            )}
          >
            {p.badge}
          </span>
        ) : null}
        {p.disc ? (
          <span
            className={cn(
              "absolute top-2.5 left-14 z-2 rounded-full px-2 py-1 text-[10px] font-black whitespace-nowrap",
              "bg-rose text-white",
            )}
          >
            {p.disc} تخفیف
          </span>
        ) : null}
        <FavButton
          id={p.id}
          name={p.name}
          className="absolute top-2.5 left-2.5"
        />
        {out ? (
          <div className="bg-navy/35 absolute inset-0 z-1 flex items-center justify-center">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-black",
                "text-navy bg-white",
              )}
            >
              <PackageX width={14} height={14} /> ناموجود
            </span>
          </div>
        ) : null}
        <div className="absolute inset-x-2.5 bottom-2.5 z-4 hidden translate-y-[130%] flex-col gap-1.5 transition-all duration-500 ease-out group-hover:translate-y-0 pointer-fine:min-[520px]:flex">
          <Link
            href={href}
            prefetch={false}
            className={cn(VIEW, "h-10 w-full rounded-[14px] text-xs shadow-md")}
          >
            <Eye width={16} height={16} /> مشاهده محصول
          </Link>
          <AddToCartButton
            out={out}
            id={p.id}
            className={cn(CART, "h-10 w-full rounded-[14px] text-xs shadow-md")}
          >
            {out ? (
              <>
                <Bell width={16} height={16} /> اطلاع از موجودی
              </>
            ) : (
              <>
                <ShoppingBag width={16} height={16} /> افزودن به سبد خرید
              </>
            )}
          </AddToCartButton>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-3 pt-3 pb-3.5">
        <div
          className={cn(
            "flex min-w-0 items-center gap-1 text-[11px]",
            "text-navy/70",
            "dark:text-khaki",
          )}
        >
          <Star className="fill-gold text-gold size-3.5" />
          <b className="text-navy dark:text-ivory">{toFaDigits(p.rate)}</b>
          <span>·</span>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {p.cat}
          </span>
        </div>
        <h3
          className={cn(
            "mt-1.5 mb-0 overflow-hidden text-sm leading-snug font-black text-ellipsis whitespace-nowrap",
            "text-navy",
            "dark:text-ivory",
          )}
        >
          {p.name}
        </h3>
        {sold}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {out ? (
            <span className="text-navy/70 dark:text-wheat text-xs font-bold">
              به‌زودی موجود می‌شود
            </span>
          ) : (
            <>
              {price}
              {p.old ? (
                // ♿ silver-on-white is ~2.5:1 here; brown-mid clears 4.5:1
                // and dark mode's own silver-on-dark contrast is untouched.
                <span className="text-brown-mid dark:text-silver text-[11px] whitespace-nowrap line-through">
                  {formatToman(p.old)}
                </span>
              ) : null}
              {p.disc ? (
                <span className="bg-rose rounded px-1.5 py-0.5 text-[10px] font-black text-white">
                  {p.disc}
                </span>
              ) : null}
            </>
          )}
        </div>
        {/* 📱 Keep actions visible under the price on narrow screens, pinned to the card's bottom edge. */}
        <div className="mt-auto grid grid-cols-1 gap-1.5 pt-2.5 @[10rem]:grid-cols-2 pointer-fine:min-[520px]:hidden">
          <Link
            href={href}
            prefetch={false}
            className={cn(VIEW, "h-9 min-w-0 text-[11px]")}
          >
            <Eye width={13} height={13} className="shrink-0" />{" "}
            <span className="truncate">مشاهده</span>
          </Link>
          <AddToCartButton
            out={out}
            id={p.id}
            className={cn(
              out ? "bg-rose-50 text-[#be123c]" : CART,
              "h-9 min-w-0 rounded-[10px] border-0 text-[11px] font-black",
            )}
          >
            {out ? "اطلاع موجودی" : "افزودن به سبد"}
          </AddToCartButton>
        </div>
      </div>
    </article>
  );
}
