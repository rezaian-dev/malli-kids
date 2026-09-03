import { HomeLanding } from "./_components/home-landing";
import { JsonLd } from "@/components/shared/json-ld";
import { CORE_PRODUCTS, pdpHref } from "@/lib/data/products";
import { buildMetadata, itemListSchema, pageSchema } from "@/lib/seo";

export const metadata = buildMetadata({
  absoluteTitle: true,
  path: "/",
});

export default function Page() {
  const featured = CORE_PRODUCTS.slice(0, 6).map((product) => ({
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
