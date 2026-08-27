import { Intro } from "@/components/shared/intro";
import { Catalog } from "@/features/product";
import { PATTERNS } from "@/lib/data/pages";


export default function PatternsPage() {
  return (
    <>
<Intro crumb="الگوهای آماده" kicker="ATELIER PATTERNS" title="الگوهای آماده دوخت" lead="هر الگو سایزبندی ۸۰ تا ۱۲۲ دارد و با فیلم برش کوتاه همراه است." />
      <Catalog items={PATTERNS} cta="خرید الگو" />
    </>
      );
}
