import type { Metadata } from "next";
import { PRICE_CAP } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";
import { parseShopState, type ShopPageSearchParams } from "./_lib/shop-state";
import { ShopExplorer } from "./_components/shop-explorer";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: ShopPageSearchParams;
}): Promise<Metadata> {
  const state = parseShopState(await searchParams);
  const filters = [
    state.cat !== "همه" ? state.cat : "",
    state.season !== "همه" ? state.season : "",
    state.q,
  ].filter(Boolean);
  const hasFilters =
    state.cat !== "همه" ||
    state.season !== "همه" ||
    state.page > 1 ||
    state.sort !== "new" ||
    state.view !== "grid" ||
    state.stock ||
    state.disc ||
    state.hot ||
    state.onlyNew ||
    !!state.q ||
    state.min > 0 ||
    state.max !== PRICE_CAP;

  return buildMetadata({
    title: filters.length ? `فروشگاه ${filters.join(" · ")}` : "فروشگاه",
    description:
      "کالکشن کامل پوشاک کودک ملی کیدز با فیلتر دسته، فصل، قیمت و موجودی.",
    path: "/shop",
    noIndex: hasFilters,
    keywords: ["فروشگاه پوشاک کودک", "خرید لباس بچه", "کالکشن کودک"],
  });
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: ShopPageSearchParams;
}) {
  const state = parseShopState(await searchParams);

  return <ShopExplorer state={state} />;
}
