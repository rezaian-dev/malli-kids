import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import {
  CORE_PRODUCTS,
  getProductById,
  parseProductRouteId,
  pdpHref,
} from "@/lib/data/products";
import { buildMetadata } from "@/lib/seo";
import { ProductDetailLanding } from "@/features/product/components/product-detail-landing";

export function generateStaticParams() {
  return CORE_PRODUCTS.map((product) => ({
    id: pdpHref(product.id).split("/").pop()!,
  }));
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
    <ProductDetailLanding
      product={product}
      requestedId={Number.isFinite(productId) ? productId : undefined}
      canonicalPath={canonicalPath}
      related={related}
    />
  );
}
