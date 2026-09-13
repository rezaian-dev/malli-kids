import { Intro } from "@/components/shared/intro";
import { ProductCatalog } from "@/components/product";
import { buildMetadata } from "@/lib/seo";

// Used only on this page — no other route reads this catalog.
const TUTORIALS = [
  {
    tag: "۲۵ دقیقه",
    t: "سرهمی در یک عصر",
    d: "الگوی سایز ۸۶ + جای دکمه شانه.",
    p: "رایگان",
  },
  {
    tag: "متوسط",
    t: "چین یکنواخت دامن",
    d: "بدون چروک و بدون نخ جمع‌شده.",
    p: "عضویت خبرنامه",
  },
  {
    tag: "پیشرفته",
    t: "زیپ مخفی پیراهن",
    d: "نصب زیپ نامرئی روی ساتن.",
    p: "ویدیو",
  },
  {
    tag: "مقدماتی",
    t: "اتوی پارچه ظریف",
    d: "دما و پارچه محافظ برای تور.",
    p: "رایگان",
  },
  {
    tag: "۲۰ دقیقه",
    t: "جاگذاری جیب پسرانه",
    d: "جیب مورب شلوار کتان.",
    p: "ویدیو",
  },
  {
    tag: "متوسط",
    t: "اتصال آستر به رویه",
    d: "تکنیک کیسه کردن آستر.",
    p: "ویدیو",
  },
];

export const dynamic = "force-static";

export const metadata = buildMetadata({
  title: "آموزش‌های آتلیه",
  description: "درس‌های کوتاه دوخت و نگهداری پارچه.",
  path: "/tutorials",
});

export default function TutorialsPage() {
  return (
    <>
      <Intro
        crumb="آموزش دوخت"
        kicker="ACADEMY"
        title="آموزش‌های آتلیه"
        lead="درس‌های کوتاه؛ از اولین کوک تا چین دامن جشن."
        path="/tutorials"
        schemaType="CollectionPage"
      />
      <ProductCatalog items={TUTORIALS} cta="دیدن الگو" />
    </>
  );
}
