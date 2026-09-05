import { Star } from "lucide-react";
import { toFaDigits } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";

// ⭐ onDark is for cards that stay navy in both themes — the reactive
// colors would barely show there
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
