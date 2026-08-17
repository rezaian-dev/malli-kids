"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

/** 🧯 Next.js `reset()` only re-renders the error boundary. Pair it with
 *  `router.refresh()` so RSC data is fetched again — otherwise the button
 *  looks dead. A hard reload is the last resort when the segment is stuck. */
export function useErrorRetry(reset: () => void) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const retry = useCallback(() => {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }, [reset, router]);

  const reload = useCallback(() => {
    window.location.reload();
  }, []);

  return { retry, reload, pending };
}
