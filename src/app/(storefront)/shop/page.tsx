import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopExplorer } from "./_components/shop-explorer";

export const metadata: Metadata = {
  title: "فروشگاه",
  description: "کالکشن کامل پوشاک کودک مالی کیدز با فیلتر دسته، فصل، قیمت و موجودی.",
};


export default function ShopPage() {
  return (
    <Suspense fallback={<p className="px-6 py-10">در حال بارگذاری فروشگاه…</p>}>
      <ShopExplorer />
    </Suspense>
  );
}
