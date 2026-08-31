import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ArticleMissing() {
  return (
    <article className="container mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-5 lg:px-7">
      <p className="text-navy/50 dark:text-wheat text-sm font-bold">
        این مقاله حذف شده یا هنوز منتشر نشده است.
      </p>
      <Button asChild variant="secondary" className="mt-4 rounded-full">
        <Link href="/articles">بازگشت به مجله</Link>
      </Button>
    </article>
  );
}
