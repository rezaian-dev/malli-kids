import type { AdminReview, Product } from "@/types";
import { ReviewSummary } from "./review-summary";
import { FeaturedReview } from "./featured-review";
import { BuyerReviewCard } from "./buyer-review-card";
import { cn } from "@/lib/utils";

export function ProductReviews({
  product,
  reviews,
}: {
  product: Product;
  reviews: AdminReview[];
}) {
  const [featured, ...others] = reviews;
  const avg = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rate, 0) / reviews.length
    : product.rate;
  const recommend = reviews.length
    ? Math.round((reviews.filter((r) => r.rate >= 4).length / reviews.length) * 100)
    : 0;

  return (
    <div className="min-w-0 space-y-4">
      <ReviewSummary avg={avg} count={reviews.length} recommend={recommend} ratings={reviews.map((r) => r.rate)} />
      {featured ? <FeaturedReview review={featured} /> : null}
      {others.length ? (
        others.map((r) => <BuyerReviewCard key={r.id} review={r} />)
      ) : !featured ? (
        <p
          className={cn(
            "rounded-3xl border border-dashed px-5 py-6 text-center text-sm leading-7",
            "border-navy/15 bg-sand text-navy/70",
            "dark:border-gold/30 dark:bg-dusk-alt dark:text-wheat",
          )}
        >
          هنوز نظری برای این محصول ثبت نشده است.
        </p>
      ) : null}
    </div>
  );
}
