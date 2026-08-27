import { Intro } from "@/components/shared/intro";
import { Catalog } from "@/features/product";
import { KITS } from "@/lib/data/pages";


export default function KitsPage() {
  return (
    <>
<Intro crumb="کیت دوخت" kicker="MAKE AT HOME" title="کیت‌های آماده دوخت" lead="هدیه به مادر خوش‌سلیقه؛ همه‌چیز داخل جعبه است." />
      <Catalog items={KITS} cta="سفارش کیت" />
    </>
      );
}
