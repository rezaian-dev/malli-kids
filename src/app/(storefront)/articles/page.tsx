import { Intro } from "@/components/shared/intro";
import { loadPublishedArticles } from "@/lib/articles";
import { buildMetadata } from "@/lib/seo";
import { ArticlesList } from "./_components/articles-list";

export const metadata = buildMetadata({
  title: "مجله ملی‌کیدز",
  description:
    "راهنمای سایز، مراقبت از پارچه، استایل‌های فصلی و نکته‌های خرید پوشاک کودک در مجله ملی‌کیدز.",
  path: "/articles",
  type: "article",
  keywords: ["مجله پوشاک کودک", "راهنمای سایز کودک", "استایل کودک"],
});

export default function ArticlesPage() {
  const seed = loadPublishedArticles();

  return (
    <>
      <Intro
        crumb="مجله"
        kicker="JOURNAL"
        title="مجله ملی‌کیدز"
        lead="راهنماهای کوتاه و کاربردی برای انتخاب سایز، نگهداری پارچه و ساختن استایل‌های کودکانه."
      />
      <div className="container mx-auto w-full max-w-4xl space-y-4 px-4 sm:px-5 lg:px-7">
        <ArticlesList initial={seed} />
      </div>
    </>
  );
}
