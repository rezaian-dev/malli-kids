import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { parseProductRouteId, pdpHref, productRouteParam } from "@/lib/data/products";
import { getAllProducts, getProductById } from "@/lib/shop/products";
import { buildMetadata } from "@/lib/seo";
import { ProductDetailLanding } from "./_components/product-detail-landing";

// ⚠️ Segment config must be a literal — Turbopack statically extracts this
// export and rejects a reference (see REVALIDATE.catalog in @/lib/cache).
export const revalidate = 60;

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    return products
      .filter((product) => product.visible)
      .map((product) => ({ id: productRouteParam(product.id) }));
  } catch (err) {
    console.warn(
      "[product/[id]] generateStaticParams failed — skipping prerender:",
      (err as Error).message,
    );
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const productId = parseProductRouteId(id);
  let product;
  try {
    product = await getProductById(productId);
  } catch (err) {
    console.warn(
      `[product/[id]] generateMetadata("${id}") failed:`,
      (err as Error).message,
    );
    product = null;
  }

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
  let product;
  try {
    product = await getProductById(productId);
  } catch (err) {
    console.warn(
      `[product/[id]] ProductPage find failed for "${id}":`,
      (err as Error).message,
    );
    product = null;
  }

  // 🙈 A hidden product 404s for customers and crawlers alike
  if (!product || !product.visible) notFound();

  const canonicalPath = pdpHref(product.id);
  const requestedPath = `/product/${id}`;

  if (requestedPath !== canonicalPath) {
    permanentRedirect(canonicalPath);
  }

  return <ProductDetailLanding product={product} canonicalPath={canonicalPath} />;
}
