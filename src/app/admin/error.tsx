"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

// 🧯 Catches errors anywhere in the admin console.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center">
      <span className="bg-rose/10 text-rose grid size-16 place-items-center rounded-3xl">
        <TriangleAlert className="size-8" />
      </span>
      <div>
        <h1 className="text-navy dark:text-ivory text-xl font-black">
          چیزی درست پیش نرفت
        </h1>
        <p className="text-navy/70 dark:text-wheat mt-2 max-w-sm text-sm leading-7">
          یک خطای غیرمنتظره در کنسول مدیریت رخ داد.
        </p>
      </div>
      <Button variant="navy" size="pill" onClick={reset}>
        تلاش دوباره
      </Button>
    </div>
  );
}
