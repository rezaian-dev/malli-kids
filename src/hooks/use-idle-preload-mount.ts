"use client";

import { useEffect, useState } from "react";

export function useIdlePreloadMount(active: boolean, preload: () => unknown) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (active) setMounted(true);
  }, [active]);

  useEffect(() => {
    if (mounted) return;

    const hasIdle = typeof window.requestIdleCallback === "function";
    const id = hasIdle
      ? window.requestIdleCallback(preload, { timeout: 4000 })
      : window.setTimeout(preload, 2500);

    return () => {
      if (hasIdle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, [mounted, preload]);

  return mounted;
}
