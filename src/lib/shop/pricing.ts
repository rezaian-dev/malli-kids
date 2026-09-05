// 💰 Lower-level percent-off math that resolvePrice builds on; used directly when no discount metadata is needed.
function campaignPrice(
  price: number,
  campaign: { active: boolean; percent: number },
): number {
  return campaign.active
    ? Math.max(
        0,
        Math.round((price * (1 - campaign.percent / 100)) / 1000) * 1000,
      )
    : price;
}

export type PricedProduct = { price: number; old?: number };

export type ResolvedPrice = {
  /** The price to charge/display right now. */
  price: number;
  /** The pre-discount price to show struck through — absent when there's
   *  nothing to compare against (no discount active at all). */
  original?: number;
  /** Rounded whole-percent label for a discount badge. */
  percent?: number;
  /** Which discount (if any) produced this result — lets a caller tell a
   *  product's own markdown apart from a site-wide festival override. */
  source: "festival" | "product" | "none";
};

// 🎪 A festival discount always overrides a product's own markdown — never stacks on top of it.
// product.old is always the true pre-discount price, so a festival's percent is off that, not off
// an already-discounted price (which would silently compound two discounts into one).
export function resolvePrice(
  product: PricedProduct,
  campaign: { active: boolean; percent: number },
): ResolvedPrice {
  if (campaign.active && campaign.percent > 0) {
    const original = product.old ?? product.price;
    const price = campaignPrice(original, campaign);
    if (price >= original) return { price: original, source: "none" };
    return {
      price,
      original,
      percent: Math.round(campaign.percent),
      source: "festival",
    };
  }

  if (product.old && product.old > product.price) {
    return {
      price: product.price,
      original: product.old,
      percent: Math.round((1 - product.price / product.old) * 100),
      source: "product",
    };
  }

  return { price: product.price, source: "none" };
}
