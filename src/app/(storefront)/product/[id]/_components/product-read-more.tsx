"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const CLAMP = {
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
} as const;

export function ProductReadMore({
  text,
  lines = 3,
  className,
}: {
  text: string;
  lines?: keyof typeof CLAMP;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [overflow, setOverflow] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || open) return;
    setOverflow(el.scrollHeight - el.clientHeight > 2);
  }, [text, open, lines]);

  return (
    <div className="min-w-0">
      <p ref={ref} className={cn(className, !open && CLAMP[lines])}>
        {text}
      </p>
      {overflow ? (
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "نمایش کمتر" : "خواندن بیشتر"}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "mt-2.5 inline-flex size-9 items-center justify-center rounded-full",
            "border-gold/55 bg-navy text-gold hover:bg-gold hover:text-navy-deep focus-visible:ring-gold border shadow-[0_10px_22px_-12px_rgba(14,42,71,.5)] transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:outline-none",
            "dark:bg-gold dark:text-navy-deep dark:hover:bg-gold-light",
          )}
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-300",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      ) : null}
    </div>
  );
}
