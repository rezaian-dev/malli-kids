"use client";

import { useEffect, useState } from "react";
import { loadReviews } from "@/lib/admin/sync";
import type { AdminReview, Product } from "@/types";
import { useLiveProduct } from "./product-live-context";
import { ReviewSummary } from "./review-summary";
import { FeaturedReview } from "./featured-review";
import { BuyerReviewCard } from "./buyer-review-card";

function featuredFor(product: Product): AdminReview {
  return {
    id: `atelier-featured-${product.id}`,
    product: product.name,
    author: "سارا محمدی",
    rate: 5,
    text: "پارچه نرم و دوخت تمیز بود؛ سایز راهنما دقیقاً همانی شد که پرو مجازی گفته بود. برای مهمانی عالی است.",
    date: "۲۸ مرداد ۱۴۰۵",
    visible: true,
  };
}

export function ProductReviews({ product: seed }: { product: Product }) {
  const product = useLiveProduct(seed);
  const [live, setLive] = useState<AdminReview[]>([]);

  useEffect(() => {
    setLive(loadReviews(true).filter((r) => r.product === product.name));
  }, [product.name]);

  const featured = featuredFor(product);
  const others = live.filter(
    (r) => r.author !== featured.author && r.id !== featured.id,
  );
  const avg = product.rate || 4.9;
  const recommend = Math.min(
    99,
    others.length
      ? Math.round(
          ((others.filter((r) => r.rate >= 4).length + 1) /
            (others.length + 1)) *
            100,
        )
      : Math.round((avg / 5) * 98),
  );
  const count = Math.max(1, others.length + 1);

  return (
    <div className="min-w-0 space-y-4">
      <ReviewSummary avg={avg} count={count} recommend={recommend} />
      <FeaturedReview review={featured} />
      {others.map((r) => (
        <BuyerReviewCard key={r.id} review={r} />
      ))}
    </div>
  );
}
