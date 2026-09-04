import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { parseProductRouteId, pdpHref } from "@/lib/data/products";
import { getProductById } from "@/lib/shop/products";
import { buildMetadata } from "@/lib/seo";
import { ProductDetailLanding } from "./_components/product-detail-landing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const productId = parseProductRouteId(id);
  const product = await getProductById(productId);

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
  const product = await getProductById(productId);

  if (!product) notFound();

  const canonicalPath = pdpHref(product.id);
  const requestedPath = `/product/${id}`;

  if (requestedPath !== canonicalPath) {
    permanentRedirect(canonicalPath);
  }

  return <ProductDetailLanding product={product} canonicalPath={canonicalPath} />;
}
