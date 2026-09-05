import { HomeLanding } from "./_components/home-landing";
import { JsonLd } from "@/components/shared/json-ld";
import { pdpHref } from "@/lib/data/products";
import { getAllProducts } from "@/lib/shop/products";
import { buildMetadata, itemListSchema, pageSchema } from "@/lib/seo";

export const metadata = buildMetadata({
  absoluteTitle: true,
  path: "/",
});

export default async function Page() {
  // 🧊 Live, cached catalog (same `getAllProducts` the shop grid/sitemap
  // use) — not the static seed array, so this list and its structured data
  // stay correct after an admin edits/hides a product.
  const catalog = await getAllProducts();
  const featured = catalog
    .filter((product) => product.visible)
    .slice(0, 6)
    .map((product) => ({
      name: product.name,
      path: pdpHref(product.id),
      image: product.img,
    }));

  return (
    <>
      <JsonLd
        data={pageSchema({
          title: "ملی‌کیدز",
          description: "پوشاک کودک با دوخت ظریف؛ دخترانه، پسرانه و سیسمونی.",
          path: "/",
        })}
      />
      <JsonLd data={itemListSchema(featured, "محصولات منتخب")} />
      <HomeLanding />
    </>
  );
}
