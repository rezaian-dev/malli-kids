import { Intro } from "@/components/shared/intro";
import { ProductCatalog } from "@/components/product";
import { buildMetadata } from "@/lib/seo";

// 📦 Used only on this page — no other route reads this catalog.
const PATTERNS = [
  {
    tag: "مجلسی",
    t: "الگوی پیراهن الماس طلایی",
    d: "دامن پفی سه‌لایه، یقه قایقی، سایز ۸۶–۱۲۲.",
    p: "۲۸۰٬۰۰۰ تومان",
  },
  {
    tag: "جشن",
    t: "الگوی توتوی صورتی",
    d: "چین متقارن و زیپ مخفی پشت.",
    p: "۲۴۰٬۰۰۰ تومان",
  },
  {
    tag: "سیسمونی",
    t: "الگوی سرهمی نوزاد",
    d: "دکمه دوبل شانه و فاق؛ مناسب پنبه.",
    p: "۱۹۰٬۰۰۰ تومان",
  },
  {
    tag: "پسرانه",
    t: "الگوی پیراهن و بند شلوار",
    d: "الگوی کلاسیک با جای کمربند.",
    p: "۲۱۰٬۰۰۰ تومان",
  },
  {
    tag: "دستدوز",
    t: "الگوی قلاب‌بافی بابونه",
    d: "نقشه رج‌به‌رج برای مادران بافنده.",
    p: "۱۶۰٬۰۰۰ تومان",
  },
  {
    tag: "پاییز",
    t: "الگوی پالتوی کلاه‌دار",
    d: "برش آستر جدا و جیب مورب.",
    p: "۳۲۰٬۰۰۰ تومان",
  },
];

export const dynamic = "force-static";

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
