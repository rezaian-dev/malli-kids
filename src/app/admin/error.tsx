"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useErrorRetry } from "@/hooks/use-error-retry";

// 🧯 Catches errors anywhere in the admin console.
export default function AdminError({
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
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center">
      <span className="bg-rose/10 text-rose grid size-16 place-items-center rounded-3xl">
        <TriangleAlert className="size-8" />
      </span>
      <div>
        <h1 className="text-navy dark:text-ivory text-xl font-black">
          مشکلی پیش آمده
        </h1>
        <p className="text-navy/70 dark:text-wheat mt-2 max-w-sm text-sm leading-7">
          خطای غیرمنتظره در کنسول. دوباره تلاش کنید یا صفحه را بارگذاری کنید.
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
          <Link href="/admin" replace>
            داشبورد
          </Link>
        </Button>
      </div>
    </div>
  );
}
