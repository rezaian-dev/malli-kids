"use client";

import { useEffect, useState } from "react";

/** 🧲 Mounts a lazily-imported dialog only once `active` goes true, and
 *  preloads its chunk on idle beforehand so opening it feels instant —
 *  shared by `CheckoutMount`/`CartCheckoutMount`'s "only pay for this once
 *  it matters" wrappers. `preload` must be a stable reference (defined at
 *  module scope, same as the `dynamic()` loader it pairs with). */
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
