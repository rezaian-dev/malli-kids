"use client";

import { useEffect, useRef } from "react";

const GAP = 28; 

export function HeaderSpacer() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header || !ref.current) return;
    const update = () => {
      if (ref.current) {
        ref.current.style.height = `${header.getBoundingClientRect().height + GAP}px`;
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  
  return <div ref={ref} aria-hidden className="h-[181px] sm:h-[166px]" />;
}
