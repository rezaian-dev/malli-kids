"use client";

import dynamic from "next/dynamic";
import { useRef, useState, type ChangeEvent } from "react";
import { ArrowRight, FilePenLine, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";

import { AdminPageHeader, useAdmin } from "@/components/admin";
import { toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AdminArticle } from "@/types";

const RichEditor = dynamic(
  () => import("@/components/admin/rich-editor").then((m) => m.RichEditor),
  {
    ssr: false,
    loading: () => (
      <div
        className={cn(
          "grid min-h-88 place-items-center rounded-3xl border border-dashed text-sm font-bold",
          "border-navy/15 text-navy/40",
          "dark:border-gold/25 dark:text-wheat",
        )}
      >
        در حال آماده‌سازی ویرایشگر…
      </div>
    ),
  },
);

const TAGS = [
  "راهنمای خرید",
  "نگهداری لباس",
  "استایل کودک",
  "سلامت کودک",
  "مجله",
];

const FIELD_LABEL = "text-navy/50 dark:text-wheat text-[11px] font-black";

export type ArticleDraft = {
  slug: string | null;
  title: string;
  tag: string;
  excerpt: string;
  body: string;
  cover: string;
  published: boolean;
  date?: string;
};

export const EMPTY_ARTICLE_DRAFT: ArticleDraft = {
  slug: null,
  title: "",
  tag: TAGS[0],
  excerpt: "",
  body: "",
  cover: "",
  published: true,
};

/** 🪶 Build a clean Persian-friendly slug from the title. */
function persianSlug(title: string, taken: string[]): string {
  const base = title
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "");
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
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    gdm[gm - 1];
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

/** ✍️ Create/edit view — owns its own draft state and saves through
 *  `useAdmin()` directly, then hands control back via `onDone`. */
export function ArticleEditor({
  initial,
  onDone,
}: {
  initial: ArticleDraft;
  onDone: () => void;
}) {
  const { db, upsertArticle } = useAdmin();
  const [draft, setDraft] = useState(initial);
  const coverRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof ArticleDraft>(k: K, v: ArticleDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  function onSave() {
    if (!draft.title.trim()) {
      toast.error("عنوان مقاله خالی است", {
        description: "یک عنوان بنویسید تا ذخیره شود.",
      });
      return;
    }
    const article: AdminArticle = {
      slug:
        draft.slug ??
        persianSlug(
          draft.title,
          db.articles.map((a) => a.slug),
        ),
      tag: draft.tag.trim() || "مجله",
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim() || draft.title.trim(),
      body: draft.body,
      cover: draft.cover || undefined,
      published: draft.published,
      date: draft.date ?? jalaliToday(),
    };
    upsertArticle(article);
    onDone();
  }

  async function onCover(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const { fileToDataUrl } = await import("@/components/admin/rich-editor");
      set("cover", await fileToDataUrl(file));
    } catch {
      toast.error("آپلود تصویر ناموفق بود");
    }
  }

  return (
    <div>
      <AdminPageHeader
        kicker="JOURNAL"
        title={draft.slug ? "ویرایش مقاله" : "مقالهٔ جدید"}
        description="محتوا، تصویر شاخص و وضعیت انتشار مقاله را در یک فضای ویرایش متمرکز مدیریت کنید."
        action={
          <Button variant="outline" className="rounded-full" onClick={onDone}>
            <ArrowRight className="size-4" /> بازگشت
          </Button>
        }
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <RichEditor
            value={draft.body}
            onChange={(html) => set("body", html)}
          />
        </div>
        <aside
          className={cn(
            "space-y-4 rounded-[22px] border p-4 backdrop-blur-[18px] transition-all duration-500 max-[639px]:rounded-[19px] sm:p-5",
            "border-navy/9 bg-paper/94 hover:border-gold/50 shadow-[0_18px_40px_-26px_rgba(14,42,71,.28)] hover:-translate-y-1 hover:shadow-[0_22px_44px_-22px_rgba(193,147,87,.28)]",
            "dark:border-gold-soft/16 dark:bg-[rgba(16,43,70,0.72)]",
          )}
        >
          <div className="space-y-1.5">
            <label className={FIELD_LABEL} htmlFor="art-title">
              عنوان
            </label>
            <Input
              id="art-title"
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="مثلاً: راهنمای سایز پالتو بچه"
              className="h-11 rounded-2xl"
            />
          </div>
          <div className="space-y-1.5">
            <span className={FIELD_LABEL}>برچسب</span>
            <div className="flex flex-wrap gap-1.5">
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("tag", t)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[11px] font-black transition",
                    draft.tag === t
                      ? "bg-navy text-ivory dark:bg-gold dark:text-navy-deep"
                      : "border-navy/12 text-navy/65 hover:border-gold/50 dark:border-gold/25 dark:bg-navy-mid dark:text-wheat border bg-white",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <Input
              value={draft.tag}
              onChange={(e) => set("tag", e.target.value)}
              placeholder="برچسب دلخواه"
              className="h-10 rounded-2xl text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <label className={FIELD_LABEL} htmlFor="art-excerpt">
              خلاصه (در فهرستِ مجله نمایش داده می‌شود)
            </label>
            <Textarea
              id="art-excerpt"
              value={draft.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={3}
              className="resize-none rounded-2xl text-sm"
              placeholder="دو سه خط کوتاه و جذاب…"
            />
          </div>
          <div className="space-y-1.5">
            <span className={FIELD_LABEL}>تصویر شاخص</span>
            {draft.cover ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- 🪶 Admin previews can use saved data URLs. */}
                <img
                  src={draft.cover}
                  alt="تصویر شاخص"
                  className="h-36 w-full rounded-2xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => set("cover", "")}
                  className="bg-rose absolute inset-e-2 top-2 grid size-8 place-items-center rounded-full text-white shadow"
                  aria-label="حذف تصویر"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ) : null}
            <input
              ref={coverRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onCover}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-2xl"
              onClick={() => coverRef.current?.click()}
            >
              <ImagePlus className="size-4" />{" "}
              {draft.cover ? "تغییر تصویر" : "آپلود تصویر شاخص"}
            </Button>
          </div>
          <label className="border-navy/8 dark:border-gold/20 flex items-center justify-between rounded-2xl border px-3 py-3">
            <span className="text-sm font-black">
              انتشار{" "}
              <span className="text-navy/45 dark:text-wheat text-[11px] font-bold">
                {draft.published ? "در مجله دیده می‌شود" : "فقط پیش‌نویس"}
              </span>
            </span>
            <Switch
              checked={draft.published}
              onCheckedChange={(v) => set("published", v)}
            />
          </label>
          <Button
            variant="navy"
            className="h-11 w-full rounded-2xl"
            onClick={onSave}
          >
            <FilePenLine className="size-4" /> ذخیره مقاله
          </Button>
        </aside>
      </div>
    </div>
  );
}
