import type { Metadata } from "next";
import { Intro } from "@/components/shared/intro";
import { loadPublishedArticles } from "@/lib/articles";
import { ArticlesList } from "./_components/articles-list";

export const metadata: Metadata = {
  title: "مجله ملی‌کیدز",
  description: "راهنمای سایز، جنس پارچه، مراقبت از لباس کودک و استایل‌های فصلی — مجلهٔ مالی کیدز.",
};

export default function ArticlesPage() {
  const seed = loadPublishedArticles(); 

  return (
    <>
      <Intro crumb="مجله" kicker="JOURNAL" title="مجله ملی‌کیدز" />
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7 max-w-4xl space-y-4">
        <ArticlesList initial={seed} />
      </div>
    </>
  );
}
