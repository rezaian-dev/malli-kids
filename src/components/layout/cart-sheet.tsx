"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  XIcon,
} from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { toFaDigits, formatToman } from "@/lib/format";
import { getProductById, pdpHref } from "@/lib/data/products";
import { BRAND } from "@/lib/constants";
import { SHIPPING_FEE } from "@/lib/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ICON_BTN, PANEL, PANEL_HEAD } from "./header-styles";

export function CartSheet() {
  const {
    cart,
    cartCount,
    setCartQty,
    removeCartItem,
    clearCart,
    campaign,
    priceOf,
  } = useStore();
  const empty = cartCount === 0;

  const rows = cart
    .map((item) => ({ item, product: getProductById(item.id) }))
    .filter(
      (
        r,
      ): r is {
        item: (typeof cart)[number];
        product: NonNullable<ReturnType<typeof getProductById>>;
      } => Boolean(r.product),
    );

  const subtotal = rows.reduce(
    (sum, { item, product }) => sum + priceOf(product.price) * item.qty,
    0,
  );
  const freeShip = subtotal >= BRAND.freeShipFrom;
  const shipping = empty ? 0 : freeShip ? 0 : SHIPPING_FEE;
  const progress = Math.min(
    100,
    Math.round((subtotal / BRAND.freeShipFrom) * 100),
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          aria-label={
            empty
              ? "سبد خرید (خالی)"
              : `سبد خرید (${toFaDigits(cartCount)} قلم)`
          }
          className={cn(
            ICON_BTN,
            "group relative border-2 transition-colors",
            "border-gold/70 bg-gold/12 hover:border-gold hover:bg-gold hover:text-navy-deep",
            "dark:border-gold/60 dark:bg-gold/15 dark:hover:bg-gold dark:hover:text-navy-deep",
          )}
        >
          <ShoppingBag
            className={cn(
              "size-5",
              "transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6",
            )}
          />

          {}
          <Badge
            aria-hidden
            className={cn(
              "pointer-events-none absolute -inset-e-1 -top-1 justify-center rounded-full border-2 p-0 tabular-nums",
              "border-cream bg-navy text-gold text-[10px] font-black",
              "dark:border-navy-deep dark:bg-navy dark:text-gold-light",
              cartCount > 9 ? "h-5 min-w-5 px-1" : "size-5",
              empty && "hidden",
            )}
          >
            {cartCount > 99 ? "+۹۹" : toFaDigits(cartCount)}
          </Badge>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        dir="rtl"
        showCloseButton={false}
        className={cn(PANEL, "flex w-[min(24rem,94vw)] flex-col")}
      >
        <SheetHeader className={cn(PANEL_HEAD, "relative pe-14")}>
          <SheetClose
            asChild
            className="absolute inset-e-3.5 top-1/2 -translate-y-1/2"
          >
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="بستن سبد خرید"
              className={cn(
                "rounded-full transition-transform duration-300 ease-out",
                "text-cream hover:text-gold-light hover:scale-105 hover:bg-white/15",
              )}
            >
              <XIcon className="size-5 text-current" />
            </Button>
          </SheetClose>
          <SheetTitle className="text-cream flex items-center gap-2 text-start text-base font-black">
            <span className="bg-gold text-navy-deep grid size-9 place-items-center rounded-2xl">
              <ShoppingBag className="size-4.5" />
            </span>
            سبد خرید
            {!empty ? (
              <Badge className="bg-gold/20 text-gold ms-auto rounded-full border-0 text-[10px] font-bold">
                {toFaDigits(cartCount)} قلم
              </Badge>
            ) : null}
          </SheetTitle>
          <SheetDescription className="text-gold-soft text-start text-[11px] font-bold">
            گالری ملی‌کیدز — خرید آنلاین به‌زودی
          </SheetDescription>
        </SheetHeader>

        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span
              className={cn(
                "grid size-24 place-items-center rounded-full",
                "from-gold-pale to-sand text-navy bg-linear-to-br",
                "dark:from-dusk-alt dark:to-dusk-mid dark:text-gold",
              )}
            >
              <ShoppingBag className="size-10" />
            </span>
            <div>
              <p className="text-navy dark:text-ivory text-base font-black">
                سبد شما خالی است
              </p>
              <p className="text-navy/70 dark:text-wheat/80 mx-auto mt-1.5 max-w-60 text-xs leading-6">
                کالکشن دوخت‌های تازه را ببینید؛ هر چه بپسندید همین‌جا برایتان
                نگه می‌داریم.
              </p>
            </div>
            <Badge className="bg-gold/15 text-gold rounded-full border-0 px-3 py-1 text-[10px] font-bold">
              <Sparkles className="me-1 size-3" /> نسخهٔ نمایشی
            </Badge>
          </div>
        ) : (
          <>
            {}
            <div className="border-navy/10 dark:border-gold/20 border-b px-4 py-3.5">
              <div className="text-navy dark:text-ivory flex items-center gap-2 text-[11px] font-black">
                <Truck className="text-gold size-4 shrink-0" />
                {freeShip ? (
                  <span>
                    ارسالِ سفارشِ شما <span className="text-gold">رایگان</span>{" "}
                    شد 🎉
                  </span>
                ) : (
                  <span>
                    <span className="text-gold">
                      {formatToman(BRAND.freeShipFrom - subtotal)} تومان
                    </span>{" "}
                    تا ارسالِ رایگان
                  </span>
                )}
                <span className="text-navy/70 dark:text-wheat/60 ms-auto text-[10px] font-bold">
                  {toFaDigits(progress)}٪
                </span>
              </div>
              <div className="bg-navy/10 mt-2 h-1.5 overflow-hidden rounded-full dark:bg-white/10">
                <div
                  className={cn(
                    "h-full rounded-full bg-linear-to-l transition-all duration-500",
                    freeShip
                      ? "from-emerald-400 to-emerald-500"
                      : "from-gold-deep to-gold-light",
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {}
            <div className="min-h-0 flex-1 scrollbar-thin space-y-2.5 overflow-y-auto px-4 py-4">
              {rows.map(({ item, product }) => (
                <div
                  key={`${item.id}-${item.size}`}
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
                        onClick={() => removeCartItem(item.id, item.size)}
                        className={cn(
                          "grid size-7 shrink-0 place-items-center",
                          "text-navy/70 hover:bg-rose/10 hover:text-rose rounded-full transition-all motion-safe:hover:scale-110 motion-safe:active:scale-90",
                          "dark:text-wheat/50 dark:hover:bg-rose/15 dark:hover:text-rose",
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
                        {formatToman(priceOf(product.price))} تومان
                        {campaign.active &&
                        priceOf(product.price) < product.price ? (
                          <s className="text-silver ms-1.5 text-[10px]">
                            {formatToman(product.price)}
                          </s>
                        ) : null}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      {}
                      <div
                        className={cn(
                          "flex items-center gap-1 p-0.5",
                          "border-navy/12 bg-sand rounded-full border",
                          "dark:border-gold/25 dark:bg-dusk-soft",
                        )}
                      >
                        <button
                          type="button"
                          aria-label="افزودن تعداد"
                          disabled={item.qty >= 9}
                          onClick={() =>
                            setCartQty(item.id, item.size, item.qty + 1)
                          }
                          className={cn(
                            "grid size-6.5 place-items-center",
                            "text-navy hover:bg-gold hover:text-navy-deep disabled:hover:text-navy rounded-full bg-white shadow-sm transition disabled:opacity-35 disabled:hover:bg-white motion-safe:hover:scale-110 motion-safe:active:scale-90 disabled:motion-safe:hover:scale-100",
                            "dark:bg-navy dark:text-ivory dark:hover:bg-gold dark:hover:text-navy-deep",
                          )}
                        >
                          <Plus className="size-3.5" />
                        </button>
                        <span
                          className={cn(
                            "min-w-5 text-center",
                            "text-navy text-xs font-black tabular-nums",
                            "dark:text-ivory",
                          )}
                        >
                          {toFaDigits(item.qty)}
                        </span>
                        <button
                          type="button"
                          aria-label="کاهش تعداد"
                          onClick={() =>
                            setCartQty(item.id, item.size, item.qty - 1)
                          }
                          className={cn(
                            "grid size-6.5 place-items-center",
                            "text-navy hover:bg-rose/10 hover:text-rose rounded-full bg-white shadow-sm transition motion-safe:hover:scale-110 motion-safe:active:scale-90",
                            "dark:bg-navy dark:text-ivory dark:hover:bg-rose/15 dark:hover:text-rose",
                          )}
                        >
                          <Minus className="size-3.5" />
                        </button>
                      </div>
                      <span
                        className={cn(
                          "text-gold-deep text-[13px] font-black tabular-nums",
                          "dark:text-gold-light",
                        )}
                      >
                        {formatToman(priceOf(product.price) * item.qty)}{" "}
                        <span className="text-navy/70 dark:text-wheat/60 text-[10px] font-bold">
                          تومان
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {}
            <div
              className={cn(
                "space-y-1.5 px-4 py-3",
                "border-navy/10 text-navy/70 border-t text-xs font-bold",
                "dark:border-gold/20 dark:text-wheat/80",
              )}
            >
              <p className="flex justify-between">
                <span>جمعِ کالاها</span>
                <span className="tabular-nums">
                  {formatToman(subtotal)} تومان
                </span>
              </p>
              <p className="flex justify-between">
                <span>ارسال</span>
                <span>
                  {freeShip ? "رایگان 🎉" : `${formatToman(shipping)} تومان`}
                </span>
              </p>
              <Separator className="bg-navy/10 dark:bg-gold/20" />
              <p className="text-navy dark:text-ivory flex justify-between text-sm font-black">
                <span>مبلغِ نهایی</span>
                <span className="text-gold-deep dark:text-gold-light tabular-nums">
                  {formatToman(subtotal + shipping)} تومان
                </span>
              </p>
            </div>
          </>
        )}

        <SheetFooter className="border-navy/10 dark:border-gold/20 gap-2 border-t px-5 py-4">
          {!empty ? (
            <Button
              variant="ghost"
              onClick={clearCart}
              className={cn(
                "h-11 w-full",
                "text-rose hover:bg-rose/10 hover:text-rose rounded-2xl text-xs font-bold",
              )}
            >
              <Trash2 className="size-4" /> خالی کردن سبد
            </Button>
          ) : null}

          <SheetClose asChild>
            <Button
              asChild
              className={cn(
                "h-11 w-full rounded-2xl text-xs font-black",
                "bg-navy text-cream hover:bg-navy-mid",
                "dark:bg-gold dark:text-navy-deep dark:hover:bg-gold-light",
              )}
            >
              <Link href="/shop">
                {empty ? "مشاهدهٔ کالکشن" : "ادامهٔ خرید"}{" "}
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
