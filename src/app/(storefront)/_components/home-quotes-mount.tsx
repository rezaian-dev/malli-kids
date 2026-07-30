"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminReview } from "@/types";

const HomeQuotes = dynamic(
  () => import("./home-quotes").then((mod) => mod.HomeQuotes),
  {
    ssr: false,
    loading: () => (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full shrink-0 sm:w-1/2" />
        ))}
      </div>
    ),
  },
);

// 📚 Defers the embla carousel (below the fold, autoplay) out of the
// homepage's initial client bundle — the reviews themselves are real,
// server-fetched data passed down from `sections/reviews.tsx`.
export function HomeQuotesMount({ reviews }: { reviews: AdminReview[] }) {
  return <HomeQuotes reviews={reviews} />;
}
