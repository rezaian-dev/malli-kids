/** 💰 Applies the site-wide campaign discount to a price — shared by the
 *  client (`useStore().priceOf`, for display) and the server (order
 *  creation, which must recompute the authoritative price itself rather
 *  than trust whatever the client sent). */
export function campaignPrice(
  price: number,
  campaign: { active: boolean; percent: number },
): number {
  return campaign.active
    ? Math.max(0, Math.round((price * (1 - campaign.percent / 100)) / 1000) * 1000)
    : price;
}
