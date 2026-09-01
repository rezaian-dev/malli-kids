import type { Metadata } from "next";

import { JsonLd } from "@/components/shared/json-ld";
import { CATALOG, pdpHref } from "@/lib/data/products";
import {
  breadcrumbSchema,
  buildMetadata,
  itemListSchema,
  pageSchema,
} from "@/lib/seo";
import { ShopExplorer } from "./_components/shop-explorer";
import {
  defaultShopState,
  isShopIndexable,
  parseShopState,
  shopCanonicalHref,
  shopHeading,
  toShopHref,
  type ShopPageSearchParams,
} from "./_lib/shop-state";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: ShopPageSearchParams;
}): Promise<Metadata> {
  const state = parseShopState(await searchParams);
  const heading = shopHeading(state);
  const indexable = isShopIndexable(state);
  const keywords = [
    ...(state.cat !== "همه" ? [state.cat] : []),
    ...(state.season !== "همه" ? [state.season] : []),
  ];

  return buildMetadata({
    title: heading === "کالکشن پوشاک کودک" ? "فروشگاه" : heading,
    description: state.q
      ? `نتایج «${state.q}» در فروشگاه ملی‌کیدز.`
      : heading === "کالکشن پوشاک کودک"
        ? "پوشاک کودک؛ دخترانه، پسرانه و سیسمونی."
        : `کالکشن ${heading} در ملی‌کیدز.`,
    path: shopCanonicalHref(state),
    noIndex: !indexable,
    keywords,
  });
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: ShopPageSearchParams;
}) {
  const state = parseShopState(await searchParams);
  const heading = shopHeading(state);
  const canonical = shopCanonicalHref(state);
  const crumbs = [
    { name: "خانه", path: "/" },
    { name: "فروشگاه", path: "/shop" },
  ];
  if (state.cat !== "همه") {
    crumbs.push({
      name: state.cat,
      path: toShopHref({ ...defaultShopState(), cat: state.cat }),
    });
  }
  if (state.season !== "همه") {
    crumbs.push({
      name: state.season,
      path: toShopHref({
        ...defaultShopState(),
        cat: state.cat,
        season: state.season,
      }),
    });
  }

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
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd
        data={pageSchema({
          title: heading,
          description:
            heading === "کالکشن پوشاک کودک"
              ? "کالکشن دخترانه، پسرانه، سیسمونی و دستدوز."
              : `کالکشن ${heading} در ملی‌کیدز.`,
          path: canonical,
          type: "CollectionPage",
        })}
      />
      {items.length ? <JsonLd data={itemListSchema(items, heading)} /> : null}
      <ShopExplorer state={state} />
    </>
  );
}
