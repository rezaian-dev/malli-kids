"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { ArrowRight, Eye, EyeOff, FilePenLine, ImagePlus, LibraryBig, PenLine, Plus, Trash2 } from "lucide-react";

import { AdminFilterBar, AdminFilterSelect, AdminStatStrip, AdminPageHeader, useAdmin } from "@/components/admin";
import { fileToDataUrl } from "@/components/admin/rich-editor";
import { toFaDigits } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { AdminArticle } from "@/types";

const RichEditor = dynamic(() => import("@/components/admin/rich-editor").then((m) => m.RichEditor), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-88 place-items-center rounded-3xl border border-dashed border-navy/15 text-sm font-bold text-navy/40 dark:border-gold/25 dark:text-wheat">
      در حال آماده‌سازی ویرایشگر…
    </div>
  ),
});

const TAGS = ["راهنمای خرید", "نگهداری لباس", "استایل کودک", "سلامت کودک", "مجله"];
const PER_PAGE = 6;
type PublishFilter = "all" | "published" | "draft";
type ArticleSort = "newest" | "oldest" | "title";

type Draft = {
  slug: string | null;
  title: string;
  tag: string;
  excerpt: string;
  body: string;
  cover: string;
  published: boolean;
  date?: string;
};

const EMPTY: Draft = { slug: null, title: "", tag: TAGS[0], excerpt: "", body: "", cover: "", published: true };

/** 🪶 Build a clean Persian-friendly slug from the title. */
function persianSlug(title: string, taken: string[]): string {
  const base = title.trim().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]/gu, "");
  let slug = base || "مقاله";
  let i = 2;
  while (taken.includes(slug)) slug = `${base}-${toFaDigits(i++)}`;
  return slug;
}

/** 🗓️ Return today's Jalali date. */
function jalaliToday(): string {
  const g = new Date();
  const gy = g.getFullYear();
  const gm = g.getMonth() + 1;
  const gd = g.getDate();
  const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = 355666 + 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + gdm[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    days -= 186;
    jm = 7 + Math.floor(days / 30);
    jd = 1 + (days % 30);
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return toFaDigits(`${jy}/${pad(jm)}/${pad(jd)}`);
}

export default function AdminArticles() {
  const { db, upsertArticle, removeArticle } = useAdmin();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [q, setQ] = useState("");
  const [publish, setPublish] = useState<PublishFilter>("all");
  const [tag, setTag] = useState("all");
  const [sort, setSort] = useState<ArticleSort>("newest");
  const coverRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  const articleTags = useMemo(() => Array.from(new Set(db.articles.map((article) => article.tag))).sort((a, b) => a.localeCompare(b, "fa")), [db.articles]);
  const filteredArticles = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    return db.articles
      .filter((article) => {
        const matchesSearch = !term || `${article.title} ${article.excerpt} ${article.tag}`.toLocaleLowerCase("fa").includes(term);
        const matchesPublish = publish === "all" || (publish === "published" ? article.published : !article.published);
        const matchesTag = tag === "all" || article.tag === tag;
        return matchesSearch && matchesPublish && matchesTag;
      })
      .sort((a, b) => {
        if (sort === "oldest") return a.date.localeCompare(b.date, "fa");
        if (sort === "title") return a.title.localeCompare(b.title, "fa");
        return b.date.localeCompare(a.date, "fa");
      });
  }, [db.articles, publish, q, sort, tag]);
  const pg = usePagination(filteredArticles, PER_PAGE, `${q}|${publish}|${tag}|${sort}`);
  const publishedCount = db.articles.filter((article) => article.published).length;
  const draftCount = db.articles.length - publishedCount;
  const activeFilters = Number(!!q.trim()) + Number(publish !== "all") + Number(tag !== "all") + Number(sort !== "newest");

  function onSave() {
    if (!draft) return;
    if (!draft.title.trim()) {
      toast.error("عنوان مقاله خالی است", { description: "یک عنوان بنویسید تا ذخیره شود." });
      return;
    }
    const article: AdminArticle = {
      slug: draft.slug ?? persianSlug(draft.title, db.articles.map((a) => a.slug)),
      tag: draft.tag.trim() || "مجله",
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim() || draft.title.trim(),
      body: draft.body,
      cover: draft.cover || undefined,
      published: draft.published,
      date: draft.date ?? jalaliToday(),
    };
    upsertArticle(article);
    setDraft(null);
  }

  async function onCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      set("cover", await fileToDataUrl(file));
    } catch {
      toast.error("آپلود تصویر ناموفق بود");
    }
  }

  /* ✍️ Editor view. */
  if (draft) {
    return (
      <div>
        <AdminPageHeader
          kicker="JOURNAL"
          title={draft.slug ? "ویرایش مقاله" : "مقالهٔ جدید"}
          description="محتوا، تصویر شاخص و وضعیت انتشار مقاله را در یک فضای ویرایش متمرکز مدیریت کنید."
          action={
            <Button variant="outline" className="rounded-full" onClick={() => setDraft(null)}>
              <ArrowRight className="size-4" /> بازگشت
            </Button>
          }
        />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-4">
            <RichEditor value={draft.body} onChange={(html) => set("body", html)} />
          </div>
          <aside className="border shadow-[0_18px_40px_-26px_rgba(14,42,71,.28)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_22px_44px_-22px_rgba(193,147,87,.28)] space-y-4 rounded-[22px] max-[639px]:rounded-[19px] border-navy/9 bg-paper/94 p-4 backdrop-blur-[18px] sm:p-5 dark:border-gold-soft/16 dark:bg-[rgba(16,43,70,0.72)]">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-navy/50 dark:text-wheat" htmlFor="art-title">
                عنوان
              </label>
              <Input id="art-title" value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="مثلاً: راهنمای سایز پالتو بچه" className="h-11 rounded-2xl" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-black text-navy/50 dark:text-wheat">برچسب</span>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("tag", t)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-black transition ${
                      draft.tag === t ? "bg-navy text-ivory dark:bg-gold dark:text-navy-deep" : "border border-navy/12 bg-white text-navy/65 hover:border-gold/50 dark:border-gold/25 dark:bg-navy-mid dark:text-wheat"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <Input value={draft.tag} onChange={(e) => set("tag", e.target.value)} placeholder="برچسب دلخواه" className="h-10 rounded-2xl text-xs" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-navy/50 dark:text-wheat" htmlFor="art-excerpt">
                خلاصه (در فهرستِ مجله نمایش داده می‌شود)
              </label>
              <Textarea id="art-excerpt" value={draft.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={3} className="resize-none rounded-2xl text-sm" placeholder="دو سه خط کوتاه و جذاب…" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-black text-navy/50 dark:text-wheat">تصویر شاخص</span>
              {draft.cover ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element -- 🪶 Admin previews can use saved data URLs. */}
                  <img src={draft.cover} alt="تصویر شاخص" className="h-36 w-full rounded-2xl object-cover" />
                  <button type="button" onClick={() => set("cover", "")} className="absolute inset-e-2 top-2 grid size-8 place-items-center rounded-full bg-rose text-white shadow" aria-label="حذف تصویر">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ) : null}
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={onCover} />
              <Button type="button" variant="outline" className="w-full rounded-2xl" onClick={() => coverRef.current?.click()}>
                <ImagePlus className="size-4" /> {draft.cover ? "تغییر تصویر" : "آپلود تصویر شاخص"}
              </Button>
            </div>
            <label className="flex items-center justify-between rounded-2xl border border-navy/8 px-3 py-3 dark:border-gold/20">
              <span className="text-sm font-black">
                انتشار <span className="text-[11px] font-bold text-navy/45 dark:text-wheat">{draft.published ? "در مجله دیده می‌شود" : "فقط پیش‌نویس"}</span>
              </span>
              <Switch checked={draft.published} onCheckedChange={(v) => set("published", v)} />
            </label>
            <Button variant="navy" className="h-11 w-full rounded-2xl" onClick={onSave}>
              <FilePenLine className="size-4" /> ذخیره مقاله
            </Button>
          </aside>
        </div>
      </div>
    );
  }

  /* 📰 List view. */
  return (
    <div>
      <AdminPageHeader
        kicker="JOURNAL"
        title="مقاله‌ها"
        description="مدیریت تقویم محتوایی، پیش‌نویس‌ها و انتشار مطالب مجله ملی کیدز."
        action={
          <Button variant="navy" onClick={() => setDraft(EMPTY)}>
            <Plus className="size-4" /> مقاله جدید
          </Button>
        }
      />
      <AdminStatStrip items={[
        { label: "کل مقاله‌ها", value: db.articles.length, Icon: LibraryBig, tone: "blue" },
        { label: "منتشرشده", value: publishedCount, Icon: Eye, tone: "emerald" },
        { label: "پیش‌نویس", value: draftCount, Icon: EyeOff, tone: "rose" },
        { label: "موضوع فعال", value: articleTags.length, Icon: FilePenLine, tone: "gold" },
      ]} />

      <AdminFilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="عنوان، خلاصه یا موضوع مقاله…"
        resultCount={filteredArticles.length}
        resultLabel="مقاله"
        activeCount={activeFilters}
        onReset={() => { setQ(""); setPublish("all"); setTag("all"); setSort("newest"); }}
      >
        <AdminFilterSelect label="وضعیت انتشار" value={publish} onValueChange={(value) => setPublish(value as PublishFilter)} options={[
          { value: "all", label: "همه مقاله‌ها", count: db.articles.length },
          { value: "published", label: "منتشرشده", count: publishedCount },
          { value: "draft", label: "پیش‌نویس", count: draftCount },
        ]} />
        <AdminFilterSelect label="موضوع" value={tag} onValueChange={setTag} options={[
          { value: "all", label: "همه موضوع‌ها" }, ...articleTags.map((item) => ({ value: item, label: item })),
        ]} />
        <AdminFilterSelect label="مرتب‌سازی" value={sort} onValueChange={(value) => setSort(value as ArticleSort)} options={[
          { value: "newest", label: "جدیدترین" }, { value: "oldest", label: "قدیمی‌ترین" }, { value: "title", label: "ترتیب عنوان" },
        ]} />
      </AdminFilterBar>

      <div className="grid gap-3">
        {pg.pageItems.map((article, index) => (
          <article key={article.slug} className="rounded-[22px] max-[639px]:rounded-[19px] border border-navy/9 bg-paper/94 shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:border-gold/40 hover:shadow-[0_24px_52px_-34px_rgba(14,42,71,0.44)] dark:border-gold-soft/16 dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)] dark:hover:border-gold-soft/30 dark:hover:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.88),0_0_34px_rgba(193,147,87,0.035)] group flex flex-col gap-3 overflow-hidden p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4" style={{ animationDelay: `${index * 45}ms` }}>
            {article.cover ? (
              /* eslint-disable-next-line @next/next/no-img-element -- 🪶 Admin previews can use saved data URLs. */
              <img src={article.cover} alt="" className="h-32 w-full rounded-2xl object-cover transition-transform duration-500 group-hover:scale-[1.02] sm:h-24 sm:w-32" />
            ) : (
              <div className="grid h-32 w-full shrink-0 place-items-center rounded-2xl bg-linear-to-br from-sand to-gold/25 text-gold-deep dark:from-navy-deep dark:to-gold/12 dark:text-gold-soft sm:h-24 sm:w-32"><FilePenLine className="size-6" /></div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-gold/12 px-2 py-1 text-[9px] font-black text-gold-deep dark:text-gold-soft">{article.tag}</span>
                <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-black ${article.published ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/12 text-amber-700 dark:text-amber-300"}`}>{article.published ? <Eye className="size-3" /> : <EyeOff className="size-3" />}{article.published ? "منتشرشده" : "پیش‌نویس"}</span>
                <span className="text-[9px] font-bold text-navy/35 dark:text-wheat">{article.date}</span>
              </div>
              <h2 className="mt-2 truncate text-sm font-black text-navy dark:text-ivory">{article.title}</h2>
              <p className="mt-1 line-clamp-2 text-xs leading-6 text-navy/50 dark:text-wheat">{article.excerpt}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:flex-col lg:flex-row">
              <label className="flex min-h-9 flex-1 items-center justify-center gap-2 rounded-xl border border-navy/8 px-3 text-[10px] font-black text-navy/55 sm:flex-none dark:border-gold/14 dark:text-wheat"><Switch checked={article.published} onCheckedChange={(value) => upsertArticle({ ...article, published: value })} /> انتشار</label>
              <Button variant="outline" className="h-9 flex-1 rounded-xl text-[10px] sm:flex-none" onClick={() => setDraft({ slug: article.slug, title: article.title, tag: article.tag, excerpt: article.excerpt, body: article.body ?? "", cover: article.cover ?? "", published: article.published, date: article.date })}><PenLine className="size-3.5" /> ویرایش</Button>
              <button type="button" onClick={() => removeArticle(article.slug)} className="grid size-9 shrink-0 place-items-center rounded-xl bg-rose/10 text-rose transition hover:bg-rose/15" aria-label={`حذف ${article.title}`}><Trash2 className="size-4" /></button>
            </div>
          </article>
        ))}
        {filteredArticles.length === 0 ? <div className="rounded-[22px] max-[639px]:rounded-[19px] border border-navy/9 bg-paper/94 shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:border-gold/40 hover:shadow-[0_24px_52px_-34px_rgba(14,42,71,0.44)] dark:border-gold-soft/16 dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)] dark:hover:border-gold-soft/30 dark:hover:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.88),0_0_34px_rgba(193,147,87,0.035)] p-12 text-center"><FilePenLine className="mx-auto size-10 text-gold" /><p className="mt-3 text-sm font-black text-navy dark:text-ivory">{db.articles.length === 0 ? "هنوز مقاله‌ای نوشته نشده" : "مقاله‌ای مطابق فیلترها نیست"}</p></div> : null}
      </div>
      {filteredArticles.length > 0 ? <Pagination pg={pg} unit="مقاله" /> : null}
    </div>
  );
}
