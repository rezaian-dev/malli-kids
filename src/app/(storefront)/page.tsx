import { HomeLanding } from "@/components/home/home-landing";
import { JsonLd } from "@/components/shared/json-ld";
import { CORE_PRODUCTS, pdpHref } from "@/lib/data/products";
import {
  buildMetadata,
  itemListSchema,
  pageSchema,
} from "@/lib/seo";

export const metadata = buildMetadata({
  title: "فروشگاه اینترنتی پوشاک کودک",
  description:
    "ملی‌کیدز؛ فروشگاه اینترنتی پوشاک کودک با کالکشن‌های دخترانه، پسرانه، سیسمونی و دستدوز، راهنمای سایز دقیق و خرید امن.",
  path: "/",
  keywords: [
    "فروشگاه اینترنتی پوشاک کودک",
    "خرید لباس کودک",
    "لباس دخترانه کودک",
    "لباس پسرانه کودک",
    "سیسمونی",
  ],
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
          title: "فروشگاه اینترنتی پوشاک کودک ملی‌کیدز",
          description:
            "کالکشن‌های خاص پوشاک کودک، راهنمای سایز دقیق و تجربه خرید امن در ملی‌کیدز.",
          path: "/",
        })}
      />
      <JsonLd data={itemListSchema(featured, "محصولات منتخب ملی‌کیدز")} />
      <HomeLanding />
    </>
  );
}
