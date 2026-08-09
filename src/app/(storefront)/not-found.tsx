import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 🧭 404 within the storefront — header/footer stay visible via the layout.
export default function StorefrontNotFound() {
  return (
    <div className="container mx-auto flex w-full flex-col items-center gap-5 px-4 py-20 text-center sm:px-5 sm:py-28 lg:px-7">
      <span
        className={cn(
          "grid size-16 place-items-center rounded-3xl",
          "bg-gold/15 text-gold",
        )}
      >
        <PackageSearch className="size-8" />
      </span>
      <div>
        <h1 className="text-navy dark:text-ivory text-2xl font-black">
          این صفحه پیدا نشد
        </h1>
        <p className="text-navy/70 dark:text-wheat mt-2 max-w-sm text-sm leading-7">
          محصول یا صفحه‌ی مورد نظر وجود ندارد یا جابه‌جا شده است.
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
