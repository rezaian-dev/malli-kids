import { Intro } from "@/components/shared/intro";
import { ProductCatalog } from "@/components/product";
import { FABRICS } from "@/lib/data/pages";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "پارچه‌های کالکشن",
  description:
    "پارچه‌های همان کالکشن ملی‌کیدز با راهنمای شست‌وشو، جنس دقیق و انتخاب مناسب برای دوخت خانگی.",
  path: "/fabrics",
  keywords: ["پارچه لباس کودک", "پارچه ارگانیک کودک", "پارچه کالکشن ملی‌کیدز"],
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
