"use client";

import { Heart } from "lucide-react";
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
        "z-3 inline-flex size-9 items-center justify-center rounded-full border shadow-md backdrop-blur transition-all duration-300 motion-safe:hover:scale-110 motion-safe:active:scale-90",
        on
          ? "border-rose bg-rose text-white"
          : "text-navy hover:text-rose border-white/40 bg-white/85",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-4 transition-transform motion-safe:duration-300",
          on && "fill-current motion-safe:scale-125",
        )}
      />
    </button>
  );
}
