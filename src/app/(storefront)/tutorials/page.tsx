import { Intro } from "@/components/shared/intro";
import { ProductCatalog } from "@/components/product";
import { TUTORIALS } from "@/lib/data/pages";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "آموزش‌های آتلیه",
  description: "درس‌های کوتاه دوخت و نگهداری پارچه.",
  path: "/tutorials",
});

export default function TutorialsPage() {
  return (
    <>
      <Intro
        crumb="آموزش دوخت"
        kicker="ACADEMY"
        title="آموزش‌های آتلیه"
        lead="درس‌های کوتاه؛ از اولین کوک تا چین دامن جشن."
        path="/tutorials"
        schemaType="CollectionPage"
      />
      <ProductCatalog items={TUTORIALS} cta="دیدن الگو" />
    </>
  );
}
