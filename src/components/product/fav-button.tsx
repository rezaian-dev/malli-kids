"use client";

import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { useFavorites } from "@/lib/favorites";
import { cn } from "@/lib/utils";

export function FavButton({
  id,
  name,
  className,
}: {
  id: number;
  name: string;
  className?: string;
}) {
  const { ids, toggle } = useFavorites();
  const on = ids.includes(id);

  return (
    <button
      type="button"
      aria-label={
        on
          ? `حذفِ «${name}» از علاقه‌مندی‌ها`
          : `افزودنِ «${name}» به علاقه‌مندی‌ها`
      }
      aria-pressed={on}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        // 🔔 `toggle` itself decides — and shows — what actually happened
        // (added/removed, or "please sign in first"); it never does both.
        toggle(id);
      }}
      className={cn(
        "z-3 inline-flex size-9 items-center justify-center rounded-full border shadow-md backdrop-blur transition-colors duration-300 motion-safe:hover:scale-110 motion-safe:active:scale-90",
        on
          ? "border-rose bg-rose text-white"
          : "text-navy hover:text-rose border-white/40 bg-white/85",
        className,
      )}
    >
      {/* 🎬 با فعال شدن، قلب با یک فنرِ کوچک بزرگ و کمی می‌چرخد — یک
          «پاپ»ِ واقعی به‌جای صرفِ scale ثابتِ CSS. */}
      <motion.span
        className="inline-flex"
        animate={
          on
            ? { scale: [1, 1.5, 1], rotate: [0, -12, 0] }
            : { scale: 1, rotate: 0 }
        }
        transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <Heart className={cn("size-4", on && "fill-current")} />
      </motion.span>
    </button>
  );
}
