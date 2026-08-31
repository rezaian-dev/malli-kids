"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { FestiveBanner as BannerItem } from "@/types";
import { FestiveBannerFallback } from "./festive-banner-fallback";

// ✨ Upgrade the banner after hydration without blocking first paint.
export function FestiveBannerMount({ item }: { item: BannerItem | null }) {
  const FestiveBannerBody = useMemo(
    () =>
      dynamic(
        () => import("./festive-banner-body").then((mod) => mod.FestiveBannerBody),
        {
          ssr: false,
          loading: () => <FestiveBannerFallback item={item} />,
        },
      ),
    [item],
  );

  return <FestiveBannerBody item={item} />;
}
