"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { StoredCampaign } from "@/lib/storefront-state";
import type { FestiveBanner as BannerItem } from "@/types";

// 🎉 Read-only context — hands server-computed campaign/banner values down
// without prop-threading
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
