import { Intro } from "@/components/shared/intro";
import { ProductCatalog } from "@/components/product";
import { buildMetadata } from "@/lib/seo";

// 📦 Used only on this page — no other route reads this catalog.
const KITS = [
  {
    tag: "تک‌نسخه",
    t: "کیت پیراهن بابونه",
    d: "الگو + پارچه + نخ طلایی + دکمه صدف.",
    p: "۱٬۴۹۰٬۰۰۰ تومان",
  },
  {
    tag: "محبوب",
    t: "کیت سیسمونی سه‌تکه",
    d: "سرهمی، کلاه، دستکش؛ پنبه ارگانیک.",
    p: "۱٬۲۸۰٬۰۰۰ تومان",
  },
  {
    tag: "مجلسی",
    t: "کیت پیراهن جشن",
    d: "ساتن، تور، زیپ مخفی و نوار اریب.",
    p: "۱٬۷۶۰٬۰۰۰ تومان",
  },
  {
    tag: "کلاسیک",
    t: "کیت پیراهن پسرانه",
    d: "کتان راه‌راه، دکمه چوبی، الگو.",
    p: "۹۹۰٬۰۰۰ تومان",
  },
  {
    tag: "فصلی",
    t: "کیت پالتوی پاییز",
    d: "پشم سبک، آستر، دکمه شاخی.",
    p: "۲٬۱۰۰٬۰۰۰ تومان",
  },
  {
    tag: "بافتنی",
    t: "کیت ژاکت بافت",
    d: "نخ مرینوس و میل شماره پیشنهادی.",
    p: "۸۷۰٬۰۰۰ تومان",
  },
];

export const dynamic = "force-static";

export const metadata = buildMetadata({
  title: "کیت‌های آماده دوخت",
  description: "الگو، پارچه و متعلقات کامل در یک جعبه.",
  path: "/kits",
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
