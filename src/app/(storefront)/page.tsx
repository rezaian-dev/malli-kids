import { HomeLanding } from "./_components/home-landing";
import { JsonLd } from "@/components/shared/json-ld";
import { pdpHref } from "@/lib/data/products";
import { getAllProducts } from "@/lib/shop/products";
import { buildMetadata, itemListSchema, pageSchema } from "@/lib/seo";

// Next.js requires literal route configuration values.
export const revalidate = 60;

export const metadata = buildMetadata({
  absoluteTitle: true,
  path: "/",
});

export default async function Page() {
  // Live cached catalog, not the static seed — correct after admin edits
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
