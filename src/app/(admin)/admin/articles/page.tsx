"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { ArrowRight, FilePenLine, ImagePlus, PenLine, Plus, Trash2 } from "lucide-react";

import { PageHead, useAdmin } from "@/features/admin";
import { fileToDataUrl } from "@/features/admin/components/rich-editor";
import { toFaDigits } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { AdminArticle } from "@/types";

const RichEditor = dynamic(() => import("@/features/admin/components/rich-editor").then((m) => m.RichEditor), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-[22rem] place-items-center rounded-3xl border border-dashed border-navy/15 text-sm font-bold text-navy/40 dark:border-gold/25 dark:text-wheat">
      در حال آماده‌سازی ویرایشگر…
    </div>
  ),
});

const TAGS = ["راهنمای خرید", "نگهداری لباس", "استایل کودک", "سلامت کودک", "مجله"];

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

/** اسلاگِ فارسی‌پسند: فاصله‌ها خط تیره، کاراکترهای نامعتبر حذف می‌شوند */
function persianSlug(title: string, taken: string[]): string {
  const base = title.trim().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]/gu, "");
  let slug = base || "مقاله";
  let i = 2;
  while (taken.includes(slug)) slug = `${base}-${toFaDigits(i++)}`;
  return slug;
}

/** تاریخِ شمسیِ امروز — الگوریتمِ استانداردِ جلالی */
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
  const coverRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

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

  /* ---------------- نمایِ ویرایشگر ---------------- */
  if (draft) {
    return (
      <div>
        <PageHead
          kicker="JOURNAL"
          title={draft.slug ? "ویرایش مقاله" : "مقالهٔ جدید"}
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
          <aside className="lux-card space-y-4 p-4 sm:p-5">
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={draft.cover} alt="تصویر شاخص" className="h-36 w-full rounded-2xl object-cover" />
                  <button type="button" onClick={() => set("cover", "")} className="absolute end-2 top-2 grid size-8 place-items-center rounded-full bg-rose text-white shadow" aria-label="حذف تصویر">
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

  /* ---------------- نمایِ فهرست ---------------- */
  return (
    <div>
      <PageHead
        kicker="JOURNAL"
        title="مقاله‌ها"
        action={
          <Button variant="navy" onClick={() => setDraft(EMPTY)}>
            <Plus className="size-4" /> مقاله جدید
          </Button>
        }
      />
      <p className="mb-4 text-sm text-navy/50 dark:text-wheat">مقاله‌های منتشرشده در «مجله» فروشگاه نمایش داده می‌شوند؛ پیش‌نویس‌ها فقط اینجا می‌مانند.</p>
      <div className="grid gap-3">
        {db.articles.map((a) => (
          <article key={a.slug} className="lux-card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
            {a.cover ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={a.cover} alt="" className="h-28 w-full rounded-2xl object-cover sm:h-20 sm:w-28" />
            ) : (
              <div className="grid h-28 w-full place-items-center rounded-2xl bg-gradient-to-br from-sand to-gold/25 text-gold-deep dark:from-navy-mid dark:to-gold/15 sm:h-20 sm:w-28">
                <FilePenLine className="size-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-black text-gold-deep dark:text-gold-soft">{a.tag}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${a.published ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"}`}>
                  {a.published ? "منتشرشده" : "پیش‌نویس"}
                </span>
                <span className="text-[10px] font-bold text-navy/40 dark:text-wheat">{a.date}</span>
              </div>
              <h2 className="mt-1.5 truncate text-sm font-black text-navy dark:text-ivory">{a.title}</h2>
              <p className="mt-1 line-clamp-2 text-xs text-navy/50 dark:text-wheat">{a.excerpt}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <label className="hidden items-center gap-1.5 text-[11px] font-black text-navy/50 sm:flex dark:text-wheat">
                <Switch
                  checked={a.published}
                  onCheckedChange={(v) => upsertArticle({ ...a, published: v })}
                />
                انتشار
              </label>
              <Button variant="outline" className="h-9 rounded-xl" onClick={() => setDraft({ slug: a.slug, title: a.title, tag: a.tag, excerpt: a.excerpt, body: a.body ?? "", cover: a.cover ?? "", published: a.published, date: a.date })}>
                <PenLine className="size-4" /> ویرایش
              </Button>
              <button type="button" onClick={() => removeArticle(a.slug)} className="grid size-9 place-items-center rounded-xl bg-rose-pale text-rose dark:bg-rose/15" aria-label={`حذف ${a.title}`}>
                <Trash2 className="size-4" />
              </button>
            </div>
          </article>
        ))}
        {db.articles.length === 0 ? <p className="lux-card p-10 text-center text-sm font-bold text-navy/45 dark:text-wheat">هنوز مقاله‌ای ننوشته‌اید.</p> : null}
      </div>
      <p className="mt-4 text-center text-[11px] font-bold text-navy/40 dark:text-wheat">مجموع: {toFaDigits(db.articles.length)} مقاله</p>
    </div>
  );
}
