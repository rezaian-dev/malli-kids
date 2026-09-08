"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useErrorRetry } from "@/hooks/use-error-retry";
import { cn } from "@/lib/utils";

// 🧯 Segment error boundary — layout (header/footer) stays mounted.
export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { retry, reload, pending } = useErrorRetry(reset);

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
          مشکلی پیش آمده
        </h1>
        <p className="text-navy/70 dark:text-wheat mt-2 max-w-sm text-sm leading-7">
          یک خطای غیرمنتظره رخ داد. دوباره تلاش کنید؛ اگر ماند، صفحه را از نو
          بارگذاری کنید یا به خانه برگردید.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          variant="navy"
          size="pill"
          disabled={pending}
          onClick={retry}
        >
          تلاش دوباره
        </Button>
        <Button type="button" variant="outline" size="pill" onClick={reload}>
          بارگذاری صفحه
        </Button>
        <Button asChild variant="gold" size="pill">
          <Link href="/" replace>
            بازگشت به خانه
          </Link>
        </Button>
      </div>
    </div>
  );
}
