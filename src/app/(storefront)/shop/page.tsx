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

// ⚠️ Segment config must be a literal — Turbopack statically extracts this
// export and rejects a reference (see REVALIDATE.catalog in @/lib/cache).
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
  // 📄 A self-canonical, indexable page N still needs a title/description
  // distinct from page 1 — otherwise every page in the sequence reports the
  // identical <title>, a duplicate-metadata signal Google's guidance warns
  // against even when the underlying products genuinely differ per page.
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

  // 🙈 `getAllProducts` is shared with the admin catalog (which needs hidden
  // rows too) — the storefront is the one consumer that must drop them.
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
