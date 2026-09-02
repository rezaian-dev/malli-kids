import { Star } from "lucide-react";
import { toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

/** ⭐ A small filled/outline star row for a rating. */
export function ReviewStars({
  n,
  className = "size-3.5",
}: {
  n: number;
  className?: string;
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
            i < n ? "fill-gold text-gold" : "text-navy/15 dark:text-wheat/25",
          )}
        />
      ))}
    </span>
  );
}
