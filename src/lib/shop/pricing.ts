/** 💰 The lower-level "apply this percent off" math `resolvePrice` below
 *  builds on. Also used directly wherever only a plain number (no discount
 *  metadata) is needed. */
export function campaignPrice(
  price: number,
  campaign: { active: boolean; percent: number },
): number {
  return campaign.active
    ? Math.max(0, Math.round((price * (1 - campaign.percent / 100)) / 1000) * 1000)
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

/** 🎪 The one rule for "which discount wins": an active festival/campaign
 *  discount *overrides* a product's own markdown — it never stacks on top
 *  of it. `product.old` (set whenever the admin gives a product its own
 *  before/after price) is always treated as the *true* pre-discount price,
 *  so a live festival recomputes its percent off of that same original
 *  price instead of shaving its percentage off whatever the product's own
 *  sale price already was.
 *
 *  Without this, a 17%-off product under a 25%-off festival would render at
 *  `price * (1 - .25)` — the customer effectively getting `0.83 * 0.75` ≈
 *  38% off — compounding a discount the store never advertised. With this,
 *  the festival period always shows and charges *exactly* its own percent
 *  off the product's real original price, and the product's own discount
 *  reappears untouched the moment the festival ends. */
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
