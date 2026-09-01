import { Intro } from "@/components/shared/intro";
import { ProductCatalog } from "@/components/product";
import { FABRICS } from "@/lib/data/pages";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "پارچه‌های کالکشن",
  description: "پارچه‌های کالکشن با راهنمای شست‌وشو.",
  path: "/fabrics",
});

export default function FabricsPage() {
  return (
    <>
      <Intro
        crumb="پارچه مدل‌ها"
        kicker="TEXTILES"
        title="پارچه‌های همان کالکشن"
        lead="متری همان پارچه‌ای که لباس‌ها از آن دوخته شده؛ با توضیح شست‌وشو."
        path="/fabrics"
        schemaType="CollectionPage"
      />
      <ProductCatalog items={FABRICS} cta="سفارش پارچه" />
    </>
  );
}
