import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ArticleMissing() {
  return (
    <article className="container mx-auto w-full px-4 sm:px-5 lg:px-7 max-w-3xl py-16 text-center">
      <p className="text-sm font-bold text-navy/50 dark:text-wheat">این مقاله حذف شده یا هنوز منتشر نشده است.</p>
      <Button asChild variant="secondary" className="mt-4 rounded-full">
        <Link href="/articles">بازگشت به مجله</Link>
      </Button>
    </article>
  );
}
