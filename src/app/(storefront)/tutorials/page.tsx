import { Intro } from "@/components/shared/intro";
import { ProductCatalog } from "@/components/product";
import { TUTORIALS } from "@/lib/data/pages";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "آموزش‌های آتلیه",
  description: "آموزش‌های کوتاه دوخت کودک، نگهداری پارچه و نکته‌های کاربردی آتلیه ملی‌کیدز.",
  path: "/tutorials",
  keywords: ["آموزش دوخت کودک", "آموزش خیاطی لباس بچه", "آموزش آتلیه"],
});

export default function TutorialsPage() {
  return (
    <>
      <Intro crumb="آموزش دوخت" kicker="ACADEMY" title="آموزش‌های آتلیه" lead="درس‌های کوتاه؛ از اولین کوک تا چین دامن جشن." />
      <ProductCatalog items={TUTORIALS} cta="دیدن الگو" />
    </>
  );
}
