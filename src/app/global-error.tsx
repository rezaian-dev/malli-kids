"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./theme.css";

// 🧯 Root layout failed — must render its own <html>/<body>.
export default function GlobalError({
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
    <html lang="fa-IR" dir="rtl">
      <body className="bg-sand text-navy flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center">
        <span className="bg-rose/10 text-rose grid size-16 place-items-center rounded-3xl">
          <TriangleAlert className="size-8" />
        </span>
        <div>
          <h1 className="text-2xl font-black">مشکلی پیش آمده</h1>
          <p className="mt-2 max-w-sm text-sm leading-7 opacity-70">
            برنامه نتوانست این صفحه را بسازد. صفحه را بارگذاری کنید.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="navy"
            size="pill"
            onClick={() => reset()}
          >
            تلاش دوباره
          </Button>
          <Button
            type="button"
            variant="outline"
            size="pill"
            onClick={() => window.location.reload()}
          >
            بارگذاری صفحه
          </Button>
        </div>
      </body>
    </html>
  );
}
