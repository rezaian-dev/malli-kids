import { notFound } from "next/navigation";
import { CORE_PRODUCTS, getProductById } from "@/lib/data/products";
import { View } from "./view";

export function generateStaticParams() {
  return CORE_PRODUCTS.map((_, i) => ({ id: String(i) }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getProductById(Number(id));
  if (!p) notFound();
  return <View product={p} />;
}
