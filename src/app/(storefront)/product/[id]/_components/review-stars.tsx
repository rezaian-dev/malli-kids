import { Star } from "lucide-react";
import { toFaDigits } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";

/** ⭐ A small filled/outline star row for a rating.
 *
 * `tone="onDark"` is for the rare card that's a fixed navy/dusk surface in
 * *both* themes (e.g. `FeaturedReview`) — the default reactive colors below
 * assume a card that flips light→dark with the site theme, so on an
 * always-dark card they'd render as barely-visible dark gold/navy in light
 * mode (see `theme.css`'s `.text-gold` light-mode override). */
export function ReviewStars({
  n,
  className = "size-3.5",
  tone = "reactive",
}: {
  n: number;
  className?: string;
  tone?: "reactive" | "onDark";
}) {
  return (
    <span
      className="inline-flex gap-0.5"
      role="img"
      aria-label={`${toFaDigits(n)} از ۵`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            className,
            tone === "onDark"
              ? i < n
                ? "fill-gold-light text-gold-light"
                : "text-ivory/25"
              : i < n
                ? "fill-gold text-gold"
                : "text-navy/15 dark:text-wheat/70",
          )}
        />
      ))}
    </span>
  );
}
