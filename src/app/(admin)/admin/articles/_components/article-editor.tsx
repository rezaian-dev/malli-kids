"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { ArrowRight, FilePenLine, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";

import { AdminPageHeader } from "@/components/admin";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createArticleAction, updateArticleAction } from "../_lib/actions";

const RichEditor = dynamic(
  () => import("@/components/admin/rich-editor").then((m) => m.RichEditor),
  {
    ssr: false,
    loading: () => (
      <div
        className={cn(
          "grid min-h-88 place-items-center rounded-3xl border border-dashed text-sm font-bold",
          "border-navy/15 text-navy/70",
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

const FIELD_LABEL = "text-navy/70 dark:text-wheat text-[11px] font-black";

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

/** ✍️ Create/edit view — owns its own draft state and saves through the
 *  real article actions, then hands control back via `onDone`. */
export function ArticleEditor({
  initial,
  onDone,
}: {
  initial: ArticleDraft;
  onDone: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [pending, startTransition] = useTransition();
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

    const values = {
      tag: draft.tag.trim() || "مجله",
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim() || draft.title.trim(),
      body: draft.body,
      cover: draft.cover || undefined,
      published: draft.published,
    };

    startTransition(async () => {
      const result = draft.slug
        ? await updateArticleAction(draft.slug, values)
        : await createArticleAction(values);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("مقاله ذخیره شد", {
        description: values.published
          ? "منتشر شد و در مجله دیده می‌شود."
          : "به‌صورت پیش‌نویس ماند.",
      });
      onDone();
    });
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
                      : "border-navy/12 text-navy/70 hover:border-gold/50 dark:border-gold/25 dark:bg-navy-mid dark:text-wheat border bg-white",
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
              <span className="text-navy/70 dark:text-wheat text-[11px] font-bold">
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
            disabled={pending}
          >
            <FilePenLine className="size-4" />{" "}
            {pending ? "در حال ذخیره…" : "ذخیره مقاله"}
          </Button>
        </aside>
      </div>
    </div>
  );
}
