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
  // The struck-through pre-discount price — absent with no discount
  original?: number;
  /** Rounded whole-percent label for a discount badge. */
  percent?: number;
  // Which discount produced this — product markdown vs festival override
  source: "festival" | "product" | "none";
};

// Campaign discounts replace product markdowns; never stack them.
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
