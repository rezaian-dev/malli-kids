"use client";

import dynamic from "next/dynamic";
import type { Product } from "@/types";

function ProductDetailsFallback() {
  return (
    <section className="mt-16" aria-label="جزئیات محصول">
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          "معرفی محصول",
          "راهنمای سایز",
          "نظر خریداران",
        ].map((label) => (
          <span
            key={label}
            className="inline-flex min-h-11 items-center rounded-full border border-navy/8 bg-white px-5 py-2.5 text-sm font-bold text-navy/55 dark:border-gold/25 dark:bg-slate dark:text-wheat"
          >
            {label}
          </span>
        ))}
      </div>
      <div className="max-w-3xl rounded-3xl border border-navy/5 bg-white p-6 text-sm leading-8 text-navy/65 dark:border-gold/30 dark:bg-slate dark:text-wheat">
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
