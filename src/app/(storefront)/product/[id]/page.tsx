import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { ProductCard } from "@/components/product";
import { JsonLd } from "@/components/shared/json-ld";
import {
  CORE_PRODUCTS,
  getProductById,
  parseProductRouteId,
  pdpHref,
} from "@/lib/data/products";
import { breadcrumbSchema, buildMetadata, productSchema } from "@/lib/seo";
import { shell } from "@/lib/utils";
import { wash } from "@/components/home/section-wash";
import { ProductBuyPanel } from "./_components/product-buy-panel";
import { ProductDetailsMount } from "./_components/product-details-mount";
import {
  LiveName,
  ProductLiveProvider,
} from "./_components/product-live-context";
import { pdpCard, pdpKicker } from "./_components/product-chrome";

export function generateStaticParams() {
  return CORE_PRODUCTS.map((product) => ({ id: pdpHref(product.id).split("/").pop()! }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const productId = parseProductRouteId(id);
  const product = getProductById(productId);

  if (!product) {
    return buildMetadata({
      title: "محصول پیدا نشد",
      description: "این محصول در حال حاضر در دسترس نیست.",
      path: `/product/${id}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: product.name,
    description: `${product.desc} خرید آنلاین از ملی‌کیدز با راهنمای سایز و ارسال سریع.`,
    path: pdpHref(product.id),
    image: product.img,
    imageAlt: product.name,
    keywords: [product.name, product.cat, product.season ?? ""],
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = parseProductRouteId(id);
  const product = getProductById(productId);

  if (!product) notFound();

  const canonicalPath = pdpHref(product.id);
  const requestedPath = `/product/${id}`;

  if (requestedPath !== canonicalPath) {
    permanentRedirect(canonicalPath);
  }

  const related = CORE_PRODUCTS.filter(
    (item) => item.id !== product.id && item.cat === product.cat,
  ).slice(0, 4);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "خانه", path: "/" },
          { name: "فروشگاه", path: "/shop" },
          { name: product.name, path: canonicalPath },
        ])}
      />
      <JsonLd data={productSchema(product)} />
      <ProductLiveProvider
        product={product}
        requestedId={Number.isFinite(productId) ? productId : undefined}
      >
        <div className={`${wash.silk} pb-2`}>
          <div className={shell}>
            <nav
              aria-label="مسیر محصول"
              className={`${pdpCard} mb-4 px-3 py-1.5 sm:mb-8 sm:px-5`}
            >
              <ol className="text-navy/45 dark:text-wheat flex flex-wrap items-center gap-1.5 text-xs font-bold">
                <li>
                  <Link href="/" className="hover:text-gold inline-block py-1.5">
                    خانه
                  </Link>
                </li>
                <li aria-hidden className="text-gold">
                  /
                </li>
                <li>
                  <Link
                    href="/shop"
                    className="hover:text-gold inline-block py-1.5"
                  >
                    فروشگاه
                  </Link>
                </li>
                <li aria-hidden className="text-gold">
                  /
                </li>
                <li className="text-navy/70 dark:text-ivory/80">
                  <LiveName product={product} />
                </li>
              </ol>
            </nav>

            <ProductBuyPanel product={product} />
            <ProductDetailsMount product={product} />

            {related.length ? (
              <section
                className={`${pdpCard} mt-8 p-4 sm:mt-12 sm:p-7`}
                aria-labelledby="related-products-heading"
              >
                <p className={pdpKicker}>COMPLETE THE LOOK</p>
                <h2
                  id="related-products-heading"
                  className="text-navy dark:text-ivory mt-1 mb-4 text-lg font-black sm:mb-6 sm:text-xl"
                >
                  مدل‌های مشابه
                </h2>
                <div className="grid grid-cols-2 gap-3 min-[480px]:grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] sm:gap-4">
                  {related.map((item) => (
                    <ProductCard key={item.id} p={item} view="grid" />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </ProductLiveProvider>
    </>
  );
}
