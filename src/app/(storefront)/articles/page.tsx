import type { Metadata } from "next";
import { Intro } from "@/components/shared/intro";
import { loadPublishedArticles } from "@/lib/articles";
import { ArticlesList } from "./_components/articles-list";

export const metadata: Metadata = {
  title: "مجله ملی‌کیدز",
  description: "راهنمای سایز، جنس پارچه، مراقبت از لباس کودک و استایل‌های فصلی — مجلهٔ مالی کیدز.",
};

/**
 * مجله — Server Component.
 * پوسته و سربرگ روی سرور رندر می‌شوند و مقاله‌های دانه هم همان‌جا داخل HTML
 * می‌آیند؛ جزیرهٔ client فقط برای جایگزینیِ فهرست با مقاله‌های ذخیره‌شدهٔ ادمین است.
 */
export default function ArticlesPage() {
  const seed = loadPublishedArticles(); // روی سرور = مقاله‌های دانه

  return (
    <>
      <Intro crumb="مجله" kicker="JOURNAL" title="مجله ملی‌کیدز" />
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7 max-w-4xl space-y-4">
        <ArticlesList initial={seed} />
      </div>
    </>
  );
}
