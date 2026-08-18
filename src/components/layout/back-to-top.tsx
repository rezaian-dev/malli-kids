"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EASE_OUT } from "@/components/motion";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="back-to-top"
          initial={{ opacity: 0, y: 18, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.85 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="fixed inset-e-6 bottom-6 z-60"
        >
          <Button
            type="button"
            variant="gold"
            size="icon-lg"
            aria-label="بازگشت به ابتدای صفحه"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={cn(
              "shadow-gold/40 size-12 rounded-full shadow-lg",
              "focus-visible:opacity-100",
            )}
          >
            <ArrowUp className="size-5" />
          </Button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
