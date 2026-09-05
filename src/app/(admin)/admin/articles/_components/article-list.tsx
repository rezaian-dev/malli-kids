"use client";

import { useMemo, useState, useTransition } from "react";
import { Eye, EyeOff, FilePenLine, LibraryBig, PenLine, Plus, Trash2 } from "lucide-react";

import {
  AdminConfirmDialog,
  AdminFilterBar,
  AdminFilterSelect,
  AdminStatStrip,
  AdminPageHeader,
} from "@/components/admin";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { Switch } from "@/components/ui/switch";
import type { AdminArticle } from "@/types";
import { removeArticleAction, setArticlePublishedAction } from "../_lib/actions";

const PER_PAGE = 6;
type PublishFilter = "all" | "published" | "draft";
type ArticleSort = "newest" | "oldest" | "title";

/** 📰 The filterable/paginated article list + publish toggle + delete. */
export function ArticleList({
  articles,
  onNew,
  onEdit,
}: {
  articles: AdminArticle[];
  onNew: () => void;
  onEdit: (article: AdminArticle) => void;
}) {
  const [, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [publish, setPublish] = useState<PublishFilter>("all");
  const [tag, setTag] = useState("all");
  const [sort, setSort] = useState<ArticleSort>("newest");

  const articleTags = useMemo(
    () =>
      Array.from(new Set(articles.map((article) => article.tag))).sort(
        (a, b) => a.localeCompare(b, "fa"),
      ),
    [articles],
  );
  const filteredArticles = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    return articles
      .filter((article) => {
        const matchesSearch =
          !term ||
          `${article.title} ${article.excerpt} ${article.tag}`
            .toLocaleLowerCase("fa")
            .includes(term);
        const matchesPublish =
          publish === "all" ||
          (publish === "published" ? article.published : !article.published);
        const matchesTag = tag === "all" || article.tag === tag;
        return matchesSearch && matchesPublish && matchesTag;
      })
      .sort((a, b) => {
        if (sort === "oldest") return a.date.localeCompare(b.date, "fa");
        if (sort === "title") return a.title.localeCompare(b.title, "fa");
        return b.date.localeCompare(a.date, "fa");
      });
  }, [articles, publish, q, sort, tag]);
  const pg = usePagination(
    filteredArticles,
    PER_PAGE,
    `${q}|${publish}|${tag}|${sort}`,
  );
  const publishedCount = articles.filter(
    (article) => article.published,
  ).length;
  const draftCount = articles.length - publishedCount;
  const activeFilters =
    Number(!!q.trim()) +
    Number(publish !== "all") +
    Number(tag !== "all") +
    Number(sort !== "newest");

  return (
    <div>
      <AdminPageHeader
        kicker="JOURNAL"
        title="مقاله‌ها"
        description="مدیریت تقویم محتوایی، پیش‌نویس‌ها و انتشار مطالب مجله ملی کیدز."
        action={
          <Button variant="navy" onClick={onNew}>
            <Plus className="size-4" /> مقاله جدید
          </Button>
        }
      />
      <AdminStatStrip
        items={[
          {
            label: "کل مقاله‌ها",
            value: articles.length,
            Icon: LibraryBig,
            tone: "blue",
          },
          {
            label: "منتشرشده",
            value: publishedCount,
            Icon: Eye,
            tone: "emerald",
          },
          { label: "پیش‌نویس", value: draftCount, Icon: EyeOff, tone: "rose" },
          {
            label: "موضوع فعال",
            value: articleTags.length,
            Icon: FilePenLine,
            tone: "gold",
          },
        ]}
      />

      <AdminFilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="عنوان، خلاصه یا موضوع مقاله…"
        resultCount={filteredArticles.length}
        resultLabel="مقاله"
        activeCount={activeFilters}
        onReset={() => {
          setQ("");
          setPublish("all");
          setTag("all");
          setSort("newest");
        }}
      >
        <AdminFilterSelect
          label="وضعیت انتشار"
          value={publish}
          onValueChange={(value) => setPublish(value as PublishFilter)}
          options={[
            { value: "all", label: "همه مقاله‌ها", count: articles.length },
            { value: "published", label: "منتشرشده", count: publishedCount },
            { value: "draft", label: "پیش‌نویس", count: draftCount },
          ]}
        />
        <AdminFilterSelect
          label="موضوع"
          value={tag}
          onValueChange={setTag}
          options={[
            { value: "all", label: "همه موضوع‌ها" },
            ...articleTags.map((item) => ({ value: item, label: item })),
          ]}
        />
        <AdminFilterSelect
          label="مرتب‌سازی"
          value={sort}
          onValueChange={(value) => setSort(value as ArticleSort)}
          options={[
            { value: "newest", label: "جدیدترین" },
            { value: "oldest", label: "قدیمی‌ترین" },
            { value: "title", label: "ترتیب عنوان" },
          ]}
        />
      </AdminFilterBar>

      <div className="grid gap-3">
        {pg.pageItems.map((article, index) => (
          <article
            key={article.slug}
            className={cn(
              adminGlassCard,
              "group flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4",
            )}
            style={{ animationDelay: `${index * 45}ms` }}
          >
            {article.cover ? (
              /* eslint-disable-next-line @next/next/no-img-element -- 🪶 Admin previews can use saved data URLs. */
              <img
                src={article.cover}
                alt={article.title}
                className="h-32 w-full rounded-2xl object-cover transition-transform duration-500 group-hover:scale-102 sm:h-24 sm:w-32"
              />
            ) : (
              <div
                className={cn(
                  "grid h-32 w-full shrink-0 place-items-center rounded-2xl bg-linear-to-br sm:h-24 sm:w-32",
                  "from-sand to-gold/25 text-gold-deep",
                  "dark:from-navy-deep dark:to-gold/12 dark:text-gold-soft",
                )}
              >
                <FilePenLine className="size-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-gold/12 text-gold-deep dark:text-gold-soft rounded-lg px-2 py-1 text-[9px] font-black">
                  {article.tag}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-black",
                    article.published
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "bg-amber-500/12 text-amber-700 dark:text-amber-300",
                  )}
                >
                  {article.published ? (
                    <Eye className="size-3" />
                  ) : (
                    <EyeOff className="size-3" />
                  )}
                  {article.published ? "منتشرشده" : "پیش‌نویس"}
                </span>
                <span className="text-navy/70 dark:text-wheat text-[9px] font-bold">
                  {article.date}
                </span>
              </div>
              <h2 className="text-navy dark:text-ivory mt-2 truncate text-sm font-black">
                {article.title}
              </h2>
              <p className="text-navy/70 dark:text-wheat mt-1 line-clamp-2 text-xs leading-6">
                {article.excerpt}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:flex-col lg:flex-row">
              <label
                className={cn(
                  "flex min-h-9 flex-1 items-center justify-center gap-2 rounded-xl border px-3 text-[10px] font-black sm:flex-none",
                  "border-navy/8 text-navy/70",
                  "dark:border-gold/14 dark:text-wheat",
                )}
              >
                <Switch
                  checked={article.published}
                  onCheckedChange={(value) =>
                    startTransition(async () => {
                      const result = await setArticlePublishedAction(
                        article.slug,
                        value,
                      );
                      if (!result.ok) toast.error(result.error);
                    })
                  }
                />{" "}
                انتشار
              </label>
              <Button
                variant="outline"
                className="h-9 flex-1 rounded-xl text-[10px] sm:flex-none"
                onClick={() => onEdit(article)}
              >
                <PenLine className="size-3.5" /> ویرایش
              </Button>
              <AdminConfirmDialog
                title="حذف این مقاله؟"
                description={`«${article.title}» برای همیشه حذف می‌شود. این عمل قابل بازگشت نیست.`}
                successMessage="مقاله حذف شد"
                onConfirm={() => removeArticleAction(article.slug)}
                trigger={
                  <button
                    type="button"
                    className="bg-rose/10 text-rose hover:bg-rose/15 grid size-9 shrink-0 place-items-center rounded-xl transition"
                    aria-label={`حذف ${article.title}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                }
              />
            </div>
          </article>
        ))}
        {filteredArticles.length === 0 ? (
          <div className={cn(adminGlassCard, "p-12 text-center")}>
            <FilePenLine className="text-gold mx-auto size-10" />
            <p className="text-navy dark:text-ivory mt-3 text-sm font-black">
              {articles.length === 0
                ? "هنوز مقاله‌ای نوشته نشده"
                : "مقاله‌ای مطابق فیلترها نیست"}
            </p>
          </div>
        ) : null}
      </div>
      {filteredArticles.length > 0 ? <Pagination pg={pg} unit="مقاله" /> : null}
    </div>
  );
}
