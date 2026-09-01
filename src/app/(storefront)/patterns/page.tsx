import { Intro } from "@/components/shared/intro";
import { ProductCatalog } from "@/components/product";
import { PATTERNS } from "@/lib/data/pages";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "الگوهای آماده دوخت",
  description: "الگوی لباس کودک با سایزبندی و راهنمای برش.",
  path: "/patterns",
});

export default function PatternsPage() {
  return (
    <>
      <Intro
        crumb="الگوهای آماده"
        kicker="ATELIER PATTERNS"
        title="الگوهای آماده دوخت"
        lead="هر الگو سایزبندی ۸۰ تا ۱۲۲ دارد و با فیلم برش کوتاه همراه است."
        path="/patterns"
        schemaType="CollectionPage"
      />
      <ProductCatalog items={PATTERNS} cta="خرید الگو" />
    </>
  );
}
