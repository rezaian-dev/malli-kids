"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { StoredCampaign } from "@/lib/storefront-state";
import type { FestiveBanner as BannerItem } from "@/types";

// 🎉 `campaign`/`banner` are real, server-computed values (see
// `app/layout.tsx` — `@/lib/shop/settings`, `@/lib/shop/banners`), fresh on
// every navigation and never mutated client-side. This just hands them down
// to the client components that need them (`PriceTag`, `ProductBuyPanel`,
// `FestiveBannerBody`) without threading them through every intermediate
// component as props — a plain read-only context, no state, no setters.
type Ctx = { campaign: StoredCampaign; banner: BannerItem | null };

const CampaignCtx = createContext<Ctx | null>(null);

export function CampaignProvider({
  children,
  campaign,
  banner,
}: Ctx & { children: ReactNode }) {
  return (
    <CampaignCtx.Provider value={{ campaign, banner }}>
      {children}
    </CampaignCtx.Provider>
  );
}

export function useCampaign() {
  const ctx = useContext(CampaignCtx);
  if (!ctx) throw new Error("CampaignProvider missing");
  return ctx;
}
