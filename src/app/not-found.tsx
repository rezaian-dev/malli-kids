import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
// 🎨 This fallback can render outside the `(storefront)` route group's own
// layout (no closer `not-found.tsx` matched), so it needs its own Tailwind
// utility-class output rather than relying on that layout's `storefront.css`
// import having already run.
import "./storefront.css";

// 🧭 Global 404 — the last resort when no closer not-found.tsx matches.
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center">
      <span className="bg-gold/15 text-gold grid size-16 place-items-center rounded-3xl">
        <PackageSearch className="size-8" />
      </span>
      <div>
        <h1 className="text-navy dark:text-ivory text-2xl font-black">
          صفحه پیدا نشد
        </h1>
        <p className="text-navy/70 dark:text-wheat mt-2 max-w-sm text-sm leading-7">
          این نشانی وجود ندارد یا جابه‌جا شده. از اینجا به فروشگاه یا صفحه اصلی
          برگردید.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="navy" size="pill">
          <Link href="/">بازگشت به خانه</Link>
        </Button>
        <Button asChild variant="gold" size="pill">
          <Link href="/shop">مشاهده فروشگاه</Link>
        </Button>
      </div>
    </div>
  );
}
