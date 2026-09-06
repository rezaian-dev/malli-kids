export const SEASONS = ["بهاره", "تابستانه", "پاییزه", "زمستانه"] as const;

export function parseProductRouteId(value: string) {
  const match = /^(\d+)/.exec(value);
  if (!match) return Number.NaN;
  return Number(match[1]);
}

// 🪶 Generic, product-agnostic words — cosmetic only (see productRouteParam
// below), so they must never encode any specific product's name.
const PRODUCT_SLUGS = [
  "kids-boutique",
  "little-style",
  "soft-wear",
  "daily-look",
  "cozy-fit",
  "gold-thread",
  "handmade-touch",
  "new-season",
] as const;

// 🪶 Cosmetic only — the route resolves products by the leading number, not this word.
function productSlug(id: number) {
  const i =
    ((id % PRODUCT_SLUGS.length) + PRODUCT_SLUGS.length) % PRODUCT_SLUGS.length;
  return PRODUCT_SLUGS[i];
}

export function productRouteParam(id: number) {
  return `${id}-${productSlug(id)}`;
}

export function pdpHref(id: number) {
  return `/product/${productRouteParam(id)}`;
}
