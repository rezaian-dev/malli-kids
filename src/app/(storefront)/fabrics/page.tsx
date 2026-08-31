import type { Metadata } from "next";
import { Intro } from "@/components/shared/intro";
import { ProductCatalog } from "@/components/product";
import { FABRICS } from "@/lib/data/pages";

export const metadata: Metadata = {
  title: "پارچه‌های کالکشن",
  description: "متری همان پارچه‌ای که لباس‌ها از آن دوخته شده؛ با راهنمای شست‌وشو.",
};



export default function FabricsPage() {
  return (
    <>
<Intro crumb="پارچه مدل‌ها" kicker="TEXTILES" title="پارچه‌های همان کالکشن" lead="متری همان پارچه‌ای که لباس‌ها از آن دوخته شده؛ با توضیح شست‌وشو." />
      <ProductCatalog items={FABRICS} cta="سفارش پارچه" />
    </>
      );
}
