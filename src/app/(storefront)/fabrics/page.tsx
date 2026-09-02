import { Intro } from "@/components/shared/intro";
import { ProductCatalog } from "@/components/product";
import { buildMetadata } from "@/lib/seo";

// 📦 Used only on this page — no other route reads this catalog.
const FABRICS = [
  {
    tag: "OEKO-TEX",
    t: "پنبه ارگانیک خامه‌ای",
    d: "۱۲۰ گرم؛ مناسب سرهمی و زیردکمه.",
    p: "۴۸۰٬۰۰۰ تومان / متر",
  },
  {
    tag: "خنک",
    t: "لینن تابستانه بژ",
    d: "چروک طبیعی، مناسب پیراهن آزاد.",
    p: "۵۲۰٬۰۰۰ تومان / متر",
  },
  {
    tag: "جشن",
    t: "ساتن براق مهمانی",
    d: "آستر کتان توصیه می‌شود.",
    p: "۶۴۰٬۰۰۰ تومان / متر",
  },
  {
    tag: "پفی",
    t: "تور نرم سه‌لایه",
    d: "بدون خارش؛ برای دامن پرنسسی.",
    p: "۳۹۰٬۰۰۰ تومان / متر",
  },
  {
    tag: "زمستان",
    t: "بافت مرینوس",
    d: "سبک و گرم برای ژاکت.",
    p: "۷۱۰٬۰۰۰ تومان / متر",
  },
  {
    tag: "پالتو",
    t: "پشم شتر شتری",
    d: "آستر جدا؛ مناسب پالتوی کلاه‌دار.",
    p: "۸۹۰٬۰۰۰ تومان / متر",
  },
];

export const dynamic = "force-static";

export const metadata = buildMetadata({
  title: "پارچه‌های کالکشن",
  description: "پارچه‌های کالکشن با راهنمای شست‌وشو.",
  path: "/fabrics",
});

export default function FabricsPage() {
  return (
    <>
      <Intro
        crumb="پارچه مدل‌ها"
        kicker="TEXTILES"
        title="پارچه‌های همان کالکشن"
        lead="متری همان پارچه‌ای که لباس‌ها از آن دوخته شده؛ با توضیح شست‌وشو."
        path="/fabrics"
        schemaType="CollectionPage"
      />
      <ProductCatalog items={FABRICS} cta="سفارش پارچه" />
    </>
  );
}
