import Image from "next/image";
import Link from "next/link";
import { Bell, Eye, PackageX, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/types";
import { formatToman, toFaDigits } from "@/lib/format";
import { pdpHref } from "@/lib/data/products";
import { AddToCart } from "./product-card-actions";
import { FavButton } from "./fav-button";
import { PriceTag } from "./price-tag";

const BADGE: Record<string, string> = {
  پرفروش: "bg-navy text-gold-light",
  جدید: "bg-gold text-navy-deep",
  "منتخب مادران": "bg-white text-navy",
};

const VIEW =
  "inline-flex items-center justify-center gap-1.5 font-black no-underline bg-white text-ink border-2 border-ink rounded-[12px] transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink hover:text-white dark:bg-transparent dark:text-ivory dark:border-ivory dark:hover:bg-ivory dark:hover:text-navy-deep";
const CART =
  "inline-flex items-center justify-center gap-1.5 font-extrabold border-0 cursor-pointer bg-navy text-ivory rounded-[12px] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 dark:bg-gold dark:text-navy-deep";

// Server Component: pure markup. Interactivity lives in the <FavButton> and
// <AddToCart> client leaves, so the card ships almost no JavaScript.
export function Card({ p, view }: { p: Product; view: "grid" | "list" }) {
  const href = pdpHref(p.id);
  const out = !p.stock;
  const badge = p.badge ? BADGE[p.badge] || "bg-navy text-gold-light" : null;

  const sold = (
    <p className="inline-flex flex-row items-center gap-1.5 m-0 mt-1.5 text-[11px] font-extrabold leading-none text-gold dark:text-gold-soft">
      <ShoppingBag className="block size-3.25 shrink-0" />
      {toFaDigits(p.sold)} فروش
    </p>
  );

  const price = out ? (
    <span className="text-rose font-extrabold text-xs">ناموجود</span>
  ) : (
    <PriceTag price={p.price} />
  );

  if (view === "list") {
    return (
      <article className="group flex min-w-0 flex-row overflow-hidden rounded-[20px] border border-navy/10 bg-white/94 transition-all duration-500 ease-out hover:-translate-y-1 hover:border-gold/55 hover:shadow-[0_18px_36px_-16px_rgba(14,42,71,.28)] dark:border-gold-soft/35 dark:bg-slate/60">
        <Link href={href} className="relative block h-auto min-h-[7.5rem] w-[6.5rem] shrink-0 overflow-hidden bg-sand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Image src={p.img} alt="" width={600} height={800} className={`absolute inset-0 size-full max-w-none object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${out ? "grayscale opacity-75" : ""}`} />
          <FavButton id={p.id} name={p.name} className="absolute right-1.5 top-1.5 size-8 shadow" />
        </Link>
        <div className="flex-1 min-w-0 p-3 flex flex-col gap-2">
          <div className="flex justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] text-navy/45 dark:text-khaki m-0">{p.cat}</p>
              <Link href={href} className="block font-black text-navy dark:text-ivory text-sm leading-snug no-underline">
                {p.name}
              </Link>
            </div>
          </div>
          {sold}
          <div className="mt-auto flex flex-wrap items-center gap-2">
            {price}
            <div className="flex gap-1.5 ms-auto">
              <Link href={href} className={`${VIEW} h-8 px-2.5 text-[11px]`}>
                <Eye width={14} height={14} /> مشاهده
              </Link>
              <AddToCart out={out} id={p.id} className={`${CART} h-8 px-2.5 text-[11px]`}>
                {out ? "خبرم کن" : "سبد"}
              </AddToCart>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group @container min-w-0 overflow-hidden rounded-[24px] border border-navy/10 bg-white/94 shadow-[0_10px_28px_-18px_rgba(14,42,71,.22)] transition-all duration-500 ease-out hover:-translate-y-2 hover:border-gold/55 hover:shadow-[0_26px_48px_-18px_rgba(14,42,71,.32)] dark:border-gold-soft/35 dark:bg-slate/60 dark:shadow-none">
      <div className="relative w-full overflow-hidden bg-sand pt-[125%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Image
          src={p.img}
          alt={p.name}
          width={600}
          height={800}
          className={`absolute inset-0 size-full max-w-none object-cover transition-transform duration-700 ease-out ${out ? "grayscale opacity-75" : "group-hover:scale-110"}`}
        />
        {badge ? (
          <span className={`absolute top-2.5 right-2.5 z-2 rounded-full px-2.5 py-1 text-[10px] font-black whitespace-nowrap ${badge}`}>
            {p.badge}
          </span>
        ) : null}
        {p.disc ? (
          <span className="absolute top-2.5 left-14 z-2 bg-rose text-white text-[10px] font-black px-2 py-1 rounded-full whitespace-nowrap">{p.disc} تخفیف</span>
        ) : null}
        <FavButton id={p.id} name={p.name} className="absolute left-2.5 top-2.5" />
        {out ? (
          <div className="absolute inset-0 z-1 bg-navy/35 flex items-center justify-center">
            <span className="bg-white text-navy text-[11px] font-black px-3 py-1.5 rounded-full inline-flex items-center gap-1">
              <PackageX width={14} height={14} /> ناموجود
            </span>
          </div>
        ) : null}
        <div className="absolute inset-x-2.5 bottom-2.5 z-4 hidden translate-y-[130%] flex-col gap-1.5 transition-all duration-500 ease-out group-hover:translate-y-0 pointer-fine:min-[520px]:flex">
          <Link href={href} className={`${VIEW} h-10 w-full text-xs rounded-[14px] shadow-md`}>
            <Eye width={16} height={16} /> مشاهده محصول
          </Link>
          <AddToCart out={out} id={p.id} className={`${CART} h-10 w-full text-xs rounded-[14px] shadow-md`}>
            {out ? (
              <>
                <Bell width={16} height={16} /> اطلاع از موجودی
              </>
            ) : (
              <>
                <ShoppingBag width={16} height={16} /> افزودن به سبد خرید
              </>
            )}
          </AddToCart>
        </div>
      </div>
      <div className="px-3 pt-3 pb-3.5">
        <div className="flex items-center gap-1 text-[11px] text-navy/45 dark:text-khaki min-w-0">
          <Star className="size-3.5 fill-gold text-gold" />
          <b className="text-navy dark:text-ivory">{toFaDigits(p.rate)}</b>
          <span>·</span>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">{p.cat}</span>
        </div>
        <h3 className="mt-1.5 mb-0 font-black text-navy dark:text-ivory text-[13px] leading-snug whitespace-nowrap overflow-hidden text-ellipsis">{p.name}</h3>
        {sold}
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          {out ? (
            <span className="text-navy/45 dark:text-wheat font-bold text-xs">به‌زودی موجود می‌شود</span>
          ) : (
            <>
              {price}
              {p.old ? <span className="text-[11px] text-silver line-through whitespace-nowrap">{formatToman(p.old)}</span> : null}
              {p.disc ? <span className="text-[10px] font-black bg-rose text-white px-1.5 py-0.5 rounded">{p.disc}</span> : null}
            </>
          )}
        </div>
        {/* تا ۵۱۹px (حالت تک‌ستونه) ردیف دکمه‌ها همیشه زیر قیمت می‌ماند؛ از ۵۲۰px
            روی دستگاه ماوس‌دار دکمه‌ها به روی تصویر و با hover می‌آیند. */}
        <div className="mt-2.5 grid grid-cols-1 gap-1.5 @[10rem]:grid-cols-2 pointer-fine:min-[520px]:hidden">
          <Link href={href} className={`${VIEW} h-9 min-w-0 text-[10px]`}>
            <Eye width={12} height={12} className="shrink-0" /> <span className="truncate">مشاهده</span>
          </Link>
          <AddToCart out={out} id={p.id} className={`${out ? "bg-rose-50 text-rose" : CART} h-9 min-w-0 rounded-[10px] border-0 text-[10px] font-black`}>
            {out ? "اطلاع موجودی" : "افزودن به سبد"}
          </AddToCart>
        </div>
      </div>
    </article>
  );
}
