"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { formatToman } from "@/lib/locale/fa";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** 📱 A slim purchase bar pinned to the bottom of the screen on small
 *  viewports, shown only once the buy panel's own "افزودن به سبد" button
 *  (`observeId`) has scrolled out of view — tracked with an
 *  `IntersectionObserver` (no scroll-position polling). Desktop never sees
 *  it; the full buy panel is already on screen there. */
export function ProductStickyBar({
  observeId,
  name,
  unit,
  canOrder,
  onAddToCart,
}: {
  observeId: string;
  name: string;
  unit: number;
  canOrder: boolean;
  onAddToCart: () => void;
}) {
  const [hidden, setHidden] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.getElementById(observeId);
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [observeId]);

  return (
    <div
      ref={ref}
      hidden={hidden}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:hidden",
        "border-navy/10 bg-paper/95 backdrop-blur",
        "dark:border-gold/25 dark:bg-dusk/95",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-navy dark:text-ivory truncate text-xs font-bold">
          {name}
        </p>
        <p className="text-gold text-sm font-black">
          {formatToman(unit)} تومان
        </p>
      </div>
      <Button
        type="button"
        variant="navy"
        disabled={!canOrder}
        className="h-11 shrink-0 rounded-2xl px-5 text-xs font-black"
        onClick={onAddToCart}
      >
        <ShoppingBag className="size-4" />
        {canOrder ? "افزودن به سبد" : "ناموجود"}
      </Button>
    </div>
  );
}
