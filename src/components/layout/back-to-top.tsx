"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * دکمهٔ «بازگشت به بالا» — فقط از کامپوننت shadcn/ui (Button) ساخته شده.
 * با اسکرول، به‌صورت نرم (فقط Tailwind) ظاهر/محو می‌شود و کلیک، صاف به ابتدای
 * صفحه برمی‌گرداند.
 */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Button
      type="button"
      variant="gold"
      size="icon-lg"
      aria-label="بازگشت به ابتدای صفحه"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-6 end-6 z-[60] size-12 rounded-full shadow-lg shadow-gold/40",
        "transition-all duration-500 ease-out",
        show
          ? "translate-y-0 opacity-100 focus-visible:opacity-100"
          : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      <ArrowUp className="size-5" />
    </Button>
  );
}
