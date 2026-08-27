import { Intro } from "@/components/shared/intro";
import { Catalog } from "@/features/product";
import { TUTORIALS } from "@/lib/data/pages";


export default function TutorialsPage() {
  return (
    <>
<Intro crumb="آموزش دوخت" kicker="ACADEMY" title="آموزش‌های آتلیه" lead="درس‌های کوتاه؛ از اولین کوک تا چین دامن جشن." />
      <Catalog items={TUTORIALS} cta="دیدن الگو" />
    </>
      );
}
