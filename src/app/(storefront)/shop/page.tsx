import type { Metadata } from "next";

import { JsonLd } from "@/components/shared/json-ld";
import { toFaDigits } from "@/lib/locale/fa";
import { pdpHref } from "@/lib/data/products";
import { getAllProducts } from "@/lib/shop/products";
import {
  breadcrumbSchema,
  buildMetadata,
  itemListSchema,
  pageSchema,
} from "@/lib/seo";
import { ShopExplorer } from "./_components/shop-explorer";
import {
  defaultShopState,
  filterShopProducts,
  isShopIndexable,
  parseShopState,
  shopCanonicalHref,
  shopHeading,
  toShopHref,
  type ShopPageSearchParams,
} from "@/lib/shop/shop-state";

// Segment config must be a literal — Turbopack static-extracts it
export const revalidate = 60;

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
  // Page N needs its own title — identical titles are a duplicate signal
  const pageSuffix =
    indexable && state.page > 1 ? ` — صفحه ${toFaDigits(state.page)}` : "";

  return buildMetadata({
    title: (heading === "کالکشن پوشاک کودک" ? "فروشگاه" : heading) + pageSuffix,
    description: state.q
      ? `نتایج «${state.q}» در فروشگاه ملی‌کیدز.`
      : heading === "کالکشن پوشاک کودک"
        ? `پوشاک کودک؛ دخترانه، پسرانه و سیسمونی.${pageSuffix}`
        : `کالکشن ${heading} در ملی‌کیدز.${pageSuffix}`,
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

  // getAllProducts serves admin too — only the storefront drops hidden rows
  const catalog = (await getAllProducts()).filter((product) => product.visible);
  const items = filterShopProducts(catalog, state)
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
      <ShopExplorer state={state} products={catalog} />
    </>
  );
}
