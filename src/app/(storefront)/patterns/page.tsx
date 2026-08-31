import type { Metadata } from "next";
import { Intro } from "@/components/shared/intro";
import { Catalog } from "@/features/product";
import { PATTERNS } from "@/lib/data/pages";

export const metadata: Metadata = {
  title: "الگوهای آماده دوخت",
  description: "الگوهای سایزبندی‌شدهٔ ۸۰ تا ۱۲۲ همراه با فیلم کوتاه برش.",
};



export default function PatternsPage() {
  return (
    <>
<Intro crumb="الگوهای آماده" kicker="ATELIER PATTERNS" title="الگوهای آماده دوخت" lead="هر الگو سایزبندی ۸۰ تا ۱۲۲ دارد و با فیلم برش کوتاه همراه است." />
      <Catalog items={PATTERNS} cta="خرید الگو" />
    </>
      );
}
