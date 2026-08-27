import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type CatalogItem = { tag: string; t: string; d: string; p: string };

export function Catalog({ items, cta }: { items: CatalogItem[]; cta: string }) {
  return (
    <div className="container mx-auto grid w-full max-w-6xl gap-4 px-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-3 lg:px-7">
      {items.map((it) => (
        <article key={it.t} className="lux-card flex flex-col p-5">
          <Badge variant="secondary" className="w-max border-gold/30 bg-gold-pale text-navy dark:bg-navy-mid dark:text-gold-soft">
            {it.tag}
          </Badge>
          <h2 className="lux-title mt-3 text-lg">{it.t}</h2>
          <p className="lux-muted mt-2 text-sm leading-7">{it.d}</p>
          <p className="mt-4 font-black text-navy dark:text-gold-soft">{it.p}</p>
          <Button asChild variant="navy" className="mt-auto h-10 rounded-full">
            <Link href="/shop">{cta}</Link>
          </Button>
        </article>
      ))}
    </div>
  );
}
