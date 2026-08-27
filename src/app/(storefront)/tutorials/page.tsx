import { Intro } from "@/components/common/intro";
import { Catalog } from "@/components/common/catalog";
import { TUTORIALS } from "@/lib/data/pages";


export default function TutorialsPage() {
  return (
    <>
<Intro crumb="آموزش دوخت" kicker="ACADEMY" title="آموزش‌های آتلیه" lead="درس‌های کوتاه؛ از اولین کوک تا چین دامن جشن." />
      <Catalog items={TUTORIALS} cta="دیدن الگو" />
    </>
      );
}
