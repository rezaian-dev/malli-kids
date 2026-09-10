import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { parseProductRouteId, pdpHref, productRouteParam } from "@/lib/data/products";
import { getAllProducts, getProductById } from "@/lib/shop/products";
import { buildMetadata } from "@/lib/seo";
import { ProductDetailLanding } from "./_components/product-detail-landing";

// ⚠️ Segment config must be a literal — Turbopack statically extracts this
// export and rejects a reference (see REVALIDATE.catalog in @/lib/cache).
export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products
    .filter((product) => product.visible)
    .map((product) => ({ id: productRouteParam(product.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const productId = parseProductRouteId(id);
  const product = await getProductById(productId);

  if (!product || !product.visible) {
    return buildMetadata({
      title: "محصول پیدا نشد",
      description: "این محصول در حال حاضر در دسترس نیست.",
      path: `/product/${id}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: product.name,
    description: product.desc,
    path: pdpHref(product.id),
    image: product.img,
    imageAlt: product.name,
    keywords: [product.cat, product.season ?? ""].filter(Boolean),
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = parseProductRouteId(id);
  const product = await getProductById(productId);

  // 🙈 An admin-hidden product is 404 to every customer/crawler, same as a
  // product that doesn't exist at all — `visible` has no other enforcement
  // point between here and the DB read.
  if (!product || !product.visible) notFound();

  const canonicalPath = pdpHref(product.id);
  const requestedPath = `/product/${id}`;

  if (requestedPath !== canonicalPath) {
    permanentRedirect(canonicalPath);
  }

  return <ProductDetailLanding product={product} canonicalPath={canonicalPath} />;
}
