import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type CatalogItem = { tag: string; t: string; d: string; p: string };

export function ProductCatalog({
  items,
  cta,
}: {
  items: CatalogItem[];
  cta: string;
}) {
  return (
    <div className="container mx-auto grid w-full max-w-6xl gap-4 px-3 xs:px-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-3 lg:px-7">
      {items.map((it) => (
        <article
          key={it.t}
          className="border-navy/8 hover:border-gold/50 dark:border-gold/30 dark:bg-slate/60 flex flex-col rounded-[26px] border bg-white/94 p-5 shadow-[0_18px_40px_-26px_rgba(14,42,71,.28)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_22px_44px_-22px_rgba(193,147,87,.28)]"
        >
          <Badge
            variant="secondary"
            className="border-gold/30 bg-gold-pale text-navy dark:bg-navy-mid dark:text-gold-soft w-max"
          >
            {it.tag}
          </Badge>
          <h2 className="text-navy dark:text-ivory mt-3 text-lg leading-snug font-black">
            {it.t}
          </h2>
          <p className="text-navy/55 dark:text-wheat mt-2 text-sm leading-7">
            {it.d}
          </p>
          <p className="text-navy dark:text-gold-soft mt-4 font-black">
            {it.p}
          </p>
          <Button asChild variant="navy" className="mt-auto h-10 rounded-full">
            <Link href="/shop">{cta}</Link>
          </Button>
        </article>
      ))}
    </div>
  );
}
