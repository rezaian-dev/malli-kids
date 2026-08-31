import type { Metadata } from "next";

import { JsonLd } from "@/components/shared/json-ld";
import { PRICE_CAP } from "@/lib/constants";
import { CATALOG, pdpHref } from "@/lib/data/products";
import {
  breadcrumbSchema,
  buildMetadata,
  itemListSchema,
  pageSchema,
} from "@/lib/seo";
import { ShopExplorer } from "./_components/shop-explorer";
import { parseShopState, type ShopPageSearchParams } from "./_lib/shop-state";

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
    title: filters.length ? `فروشگاه ${filters.join(" · ")}` : "فروشگاه پوشاک کودک",
    description:
      "کالکشن کامل پوشاک کودک ملی‌کیدز با فیلتر دسته، فصل، قیمت، موجودی و جست‌وجوی سریع.",
    path: "/shop",
    noIndex: hasFilters,
    keywords: [
      "فروشگاه پوشاک کودک",
      "خرید لباس بچه",
      "کالکشن کودک",
      "فروشگاه دخترانه کودک",
      "فروشگاه پسرانه کودک",
    ],
  });
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: ShopPageSearchParams;
}) {
  const state = parseShopState(await searchParams);
  const items = CATALOG.filter((product) => {
    if (state.cat !== "همه" && product.cat !== state.cat) return false;
    if (state.season !== "همه" && product.season !== state.season) return false;
    if (state.stock && !product.stock) return false;
    if (state.disc && !product.disc && !product.old) return false;
    if (state.hot && product.rate < 4.8) return false;
    if (state.onlyNew && product.badge !== "جدید") return false;
    if (product.price < state.min || product.price > state.max) return false;
    if (!state.q) return true;

    const haystack = `${product.name} ${product.cat} ${product.season ?? ""}`
      .toLocaleLowerCase("fa")
      .trim();

    return haystack.includes(state.q.toLocaleLowerCase("fa"));
  })
    .slice(0, 12)
    .map((product) => ({
      name: product.name,
      path: pdpHref(product.id),
      image: product.img,
    }));

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "خانه", path: "/" },
          { name: "فروشگاه", path: "/shop" },
        ])}
      />
      <JsonLd
        data={pageSchema({
          title: "فروشگاه پوشاک کودک ملی‌کیدز",
          description:
            "جست‌وجو و فیلتر کالکشن‌های دخترانه، پسرانه، سیسمونی و دستدوز در فروشگاه ملی‌کیدز.",
          path: "/shop",
          type: "CollectionPage",
        })}
      />
      {items.length ? <JsonLd data={itemListSchema(items, "کالکشن فروشگاه")} /> : null}
      <ShopExplorer state={state} />
    </>
  );
}
