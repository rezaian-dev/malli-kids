"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { formatToman } from "@/lib/locale/fa";
import { Button } from "@/components/ui/button";

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
  const [ctaVisible, setCtaVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(observeId);
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setCtaVisible(entry.isIntersecting),
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [observeId]);

  // Never cover the footer — the bar is a scrolling aid, not chrome.
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(([entry]) =>
      setFooterVisible(entry.isIntersecting),
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const visible = !ctaVisible && !footerVisible;

  // Lets the chat bubble lift clear of the bar (see storefront.css).
  useEffect(() => {
    if (visible) document.body.dataset.pdpBar = "1";
    else delete document.body.dataset.pdpBar;
    return () => {
      delete document.body.dataset.pdpBar;
    };
  }, [visible]);

  // Conditional render — the `hidden` attribute loses to the `flex` utility
  // (preflight's :where() carries zero specificity), so it could never hide this.
  if (!visible) return null;

  return (
    <div
      id="pdp-sticky-bar"
      className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:hidden border-navy/10 bg-paper/95 backdrop-blur dark:border-gold/25 dark:bg-dusk/95"
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
