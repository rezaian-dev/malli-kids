"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

// 🧯 reset() + router.refresh() — a bare reset leaves RSC data stale
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
