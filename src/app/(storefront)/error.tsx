"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 🧯 Segment-level error boundary — header/footer stay visible via the layout.
export default function StorefrontError({
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
    <div className="container mx-auto flex w-full flex-col items-center gap-5 px-4 py-20 text-center sm:px-5 sm:py-28 lg:px-7">
      <span
        className={cn(
          "grid size-16 place-items-center rounded-3xl",
          "bg-rose/10 text-rose",
        )}
      >
        <TriangleAlert className="size-8" />
      </span>
      <div>
        <h1 className="text-navy dark:text-ivory text-2xl font-black">
          چیزی درست پیش نرفت
        </h1>
        <p className="text-navy/70 dark:text-wheat mt-2 max-w-sm text-sm leading-7">
          یک خطای غیرمنتظره رخ داد. می‌توانید دوباره تلاش کنید یا به خانه
          برگردید.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="navy" size="pill" onClick={reset}>
          تلاش دوباره
        </Button>
        <Button asChild variant="outline" size="pill">
          <Link href="/">بازگشت به خانه</Link>
        </Button>
      </div>
    </div>
  );
}
