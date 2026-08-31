import { Intro } from "@/components/shared/intro";
import { ProductCatalog } from "@/components/product";
import { KITS } from "@/lib/data/pages";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "کیت‌های آماده دوخت",
  description:
    "کیت‌های آماده دوخت ملی‌کیدز با الگو، پارچه و متعلقات کامل برای مادران و آتلیه‌های خانگی.",
  path: "/kits",
  keywords: ["کیت دوخت کودک", "کیت خیاطی کودک", "الگو و پارچه آماده"],
});

export default function KitsPage() {
  return (
    <>
      <Intro
        crumb="کیت دوخت"
        kicker="MAKE AT HOME"
        title="کیت‌های آماده دوخت"
        lead="هدیه به مادر خوش‌سلیقه؛ همه‌چیز داخل جعبه است."
        path="/kits"
        schemaType="CollectionPage"
      />
      <ProductCatalog items={KITS} cta="سفارش کیت" />
    </>
  );
}
