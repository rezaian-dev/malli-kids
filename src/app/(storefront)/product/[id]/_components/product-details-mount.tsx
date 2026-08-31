"use client";

import dynamic from "next/dynamic";
import type { Product } from "@/types";
import { pdpCard, pdpKicker, pdpWell } from "./product-chrome";

function ProductDetailsFallback() {
  return (
    <section className={`${pdpCard} mt-10 overflow-hidden sm:mt-12`} aria-label="جزئیات محصول">
      <div className="border-navy/8 dark:border-gold/20 border-b px-5 py-5 sm:px-7">
        <p className={pdpKicker}>ATELIER FILE</p>
        <h2 className="text-navy dark:text-ivory mt-1 text-lg font-black">
          جزئیات، سایز و نظرها
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {["معرفی", "راهنمای سایز", "نظر خریداران"].map((label) => (
            <span
              key={label}
              className="inline-flex min-h-11 items-center rounded-full border border-navy/8 bg-white px-5 py-2.5 text-sm font-bold text-navy/55 dark:border-gold/25 dark:bg-slate dark:text-wheat"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className={`${pdpWell} m-5 p-5 text-sm leading-8 text-navy/65 sm:m-7 dark:text-wheat`}>
        جزئیات تکمیلی، جدول سایز و نظر خریداران بلافاصله بعد از بارگذاری این بخش
        نمایش داده می‌شود.
      </div>
    </section>
  );
}

const ProductDetailsTabs = dynamic(
  () => import("./product-details-tabs").then((mod) => mod.ProductDetailsTabs),
  {
    ssr: false,
    loading: () => <ProductDetailsFallback />,
  },
);

// 📚 Defer below-the-fold product tabs and review logic.
export function ProductDetailsMount({ product }: { product: Product }) {
  return <ProductDetailsTabs product={product} />;
}
