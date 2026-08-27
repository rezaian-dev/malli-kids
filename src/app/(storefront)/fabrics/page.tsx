import { Intro } from "@/components/shared/intro";
import { Catalog } from "@/features/product";
import { FABRICS } from "@/lib/data/pages";


export default function FabricsPage() {
  return (
    <>
<Intro crumb="پارچه مدل‌ها" kicker="TEXTILES" title="پارچه‌های همان کالکشن" lead="متری همان پارچه‌ای که لباس‌ها از آن دوخته شده؛ با توضیح شست‌وشو." />
      <Catalog items={FABRICS} cta="سفارش پارچه" />
    </>
      );
}
