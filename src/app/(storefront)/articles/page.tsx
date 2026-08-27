import Link from "next/link";
import { Intro } from "@/components/shared/intro";
import { ARTICLES } from "@/lib/data/pages";
import { Badge } from "@/components/ui/badge";


export default function ArticlesPage() {
  return (
    <>
<Intro crumb="مجله" kicker="JOURNAL" title="مجله ملی‌کیدز" />
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7 max-w-4xl space-y-4">
        {ARTICLES.map((a) => (
          <Link key={a.slug} href={`/articles/${a.slug}`} className="block rounded-3xl bg-white dark:bg-dusk border border-navy/10 dark:border-gold/30 p-6">
            <Badge variant="secondary">{a.tag}</Badge>
            <h2 className="font-black text-lg mt-3 text-navy dark:text-ivory">{a.title}</h2>
            <p className="text-sm text-muted-foreground mt-2">{a.excerpt}</p>
          </Link>
        ))}
      </div>
    </>
      );
}
