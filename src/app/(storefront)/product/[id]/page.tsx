import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CORE_PRODUCTS, getProductById } from "@/lib/data/products";
import { ProductCard } from "@/components/product";
import { shell } from "@/lib/utils";
import { ProductBuyPanel } from "./_components/product-buy-panel";
import { ProductDetailsTabs } from "./_components/product-details-tabs";
import { LiveName, ProductLiveProvider } from "./_components/product-live-context";

export function generateStaticParams() {
  return CORE_PRODUCTS.map((_, i) => ({ id: String(i) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getProductById(Number(id));
  return p ? { title: p.name, description: p.desc } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  const p = getProductById(num);
  if (!p) notFound();

  const related = CORE_PRODUCTS.filter((x) => x.id !== p.id && x.cat === p.cat).slice(0, 4);

  return (
    <ProductLiveProvider product={p} requestedId={Number.isFinite(num) ? num : undefined}>
      <div>
        <div className={shell}>
          <p className="mb-8 text-xs font-bold text-navy/45 dark:text-wheat">
            <Link href="/" className="inline-block py-1.5 hover:text-gold">خانه</Link>
            <span className="mx-1.5 text-gold">/</span>
            <Link href="/shop" className="inline-block py-1.5 hover:text-gold">فروشگاه</Link>
            <span className="mx-1.5 text-gold">/</span>
            <LiveName product={p} />
          </p>
          <ProductBuyPanel product={p} />
          <ProductDetailsTabs product={p} />
          {related.length ? (
            <section className="mt-16">
              <h2 className="mb-6 text-xl font-black text-navy dark:text-ivory">مدل‌های مشابه</h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] gap-4">
                {related.map((x) => (
                  <ProductCard key={x.id} p={x} view="grid" />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </ProductLiveProvider>
  );
}
