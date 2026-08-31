import type { Metadata } from "next";
import { Intro } from "@/components/shared/intro";
import { ProductCatalog } from "@/components/product";
import { TUTORIALS } from "@/lib/data/pages";

export const metadata: Metadata = {
  title: "آموزش‌های آتلیه",
  description: "درس‌های کوتاه دوخت؛ از اولین کوک تا چین دامن جشن.",
};

export default function TutorialsPage() {
  return (
    <>
<Intro crumb="آموزش دوخت" kicker="ACADEMY" title="آموزش‌های آتلیه" lead="درس‌های کوتاه؛ از اولین کوک تا چین دامن جشن." />
      <ProductCatalog items={TUTORIALS} cta="دیدن الگو" />
    </>
      );
}
