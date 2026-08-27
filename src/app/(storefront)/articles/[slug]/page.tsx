import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES } from "@/lib/data/pages";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}


export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = ARTICLES.find((x) => x.slug === slug);
  if (!a) notFound();
  return (
    <article className="container mx-auto w-full px-4 sm:px-5 lg:px-7 max-w-3xl">
      <p className="text-xs text-muted-foreground">
        <Link href="/" className="inline-block py-1.5">خانه</Link> / <Link href="/articles" className="inline-block py-1.5">مجله</Link> / {a.title}
      </p>
      <Badge variant="secondary" className="mt-4">
        {a.tag}
      </Badge>
      <h1 className="text-3xl font-black mt-3 text-navy dark:text-ivory">{a.title}</h1>
      <p className="mt-6 leading-9 text-navy/75 dark:text-cream/75">{a.body}</p>
      <p className="mt-4 leading-9 text-muted-foreground">اگر بین دو سایز هستید معمولاً سایز بزرگ‌تر راحت‌تر است؛ به‌خصوص برای پالتو و لباس رویی.</p>
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
    </article>
  );
}
