import type { Metadata } from "next";
import { ShopExplorer } from "./_components/shop-explorer";
import { parseShopState, type ShopPageSearchParams } from "./_lib/shop-state";

export const metadata: Metadata = {
  title: "فروشگاه",
  description: "کالکشن کامل پوشاک کودک مالی کیدز با فیلتر دسته، فصل، قیمت و موجودی.",
};

export default async function ShopPage({ searchParams }: { searchParams: ShopPageSearchParams }) {
  const state = parseShopState(await searchParams);

  return <ShopExplorer state={state} />;
}
