import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ArticleActions() {
  return (
    <div className="flex flex-wrap gap-2 mt-8">
      <Button asChild className="rounded-full">
        <Link href="/shop">فروشگاه</Link>
      </Button>
      <Button asChild variant="secondary" className="rounded-full">
        <Link href="/tryon">پرو مجازی</Link>
      </Button>
      <Button asChild variant="ghost" className="rounded-full">
        <Link href="/articles">بازگشت به مجله</Link>
      </Button>
    </div>
  );
}
