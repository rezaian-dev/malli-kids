import { notFound } from "next/navigation";
import { CORE_PRODUCTS, getProductById } from "@/lib/data/products";
import { View } from "./view";

export function generateStaticParams() {
  return CORE_PRODUCTS.map((_, i) => ({ id: String(i) }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  const p = getProductById(num);
  if (!p) notFound();
  return <View product={p} requestedId={Number.isFinite(num) ? num : undefined} />;
}
