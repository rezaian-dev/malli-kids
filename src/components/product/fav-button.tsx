"use client";

import { Heart } from "lucide-react";
import { toggleFav, useFavorites } from "@/lib/favorites";
import { useStore } from "@/providers/store-provider";
import { cn } from "@/lib/utils";

/**
 * قلبِ علاقه‌مندی روی کارتِ محصول — بی‌درنگ پر/خالی می‌شود و در تبِ
 * «علاقه‌مندی‌ها» پنل کاربری جمع می‌شود.
 */
export function FavButton({ id, name, className }: { id: number; name: string; className?: string }) {
  const favs = useFavorites();
  const { showToast } = useStore();
  const on = favs.includes(id);

  return (
    <button
      type="button"
      aria-label={on ? `حذفِ «${name}» از علاقه‌مندی‌ها` : `افزودنِ «${name}» به علاقه‌مندی‌ها`}
      aria-pressed={on}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFav(id);
        showToast(on ? "از علاقه‌مندی‌ها حذف شد" : "به علاقه‌مندی‌ها اضافه شد ❤️");
      }}
      className={cn(
        "z-3 inline-flex size-9 items-center justify-center rounded-full border shadow-md backdrop-blur transition-all duration-300 hover:scale-110 active:scale-95",
        on
          ? "border-rose bg-rose text-white"
          : "border-white/40 bg-white/85 text-navy hover:text-rose",
        className,
      )}
    >
      <Heart className={cn("size-4 transition-transform", on && "scale-110 fill-current")} />
    </button>
  );
}
