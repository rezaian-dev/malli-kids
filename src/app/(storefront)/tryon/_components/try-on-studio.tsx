"use client";

import Image from "next/image";

import { useMemo, useRef, useState } from "react";
import { Download, Loader2, Shirt, Sparkles, Upload } from "lucide-react";
import { CORE_PRODUCTS } from "@/lib/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
type Phase = "idle" | "running" | "done" | "error";

// 🧪 Ready-made sample models let parents try the studio instantly.
const SAMPLE_MODELS = CORE_PRODUCTS.slice(0, 4).map((p) => p.img);

function sizeForHeight(h: number): string {
  const table: [number, string][] = [
    [80, "۸۰"],
    [86, "۸۶"],
    [92, "۹۲"],
    [98, "۹۸"],
    [104, "۱۰۴"],
    [110, "۱۱۰"],
    [116, "۱۱۶"],
  ];
  for (const [max, label] of table) if (h < max) return label;
  return "۱۲۲";
}

function swatchClass(active: boolean) {
  return cn(
    "overflow-hidden rounded-xl border-2 transition",
    active ? "border-gold" : "hover:border-gold/40 border-transparent",
  );
}

export function Studio() {
  const [person, setPerson] = useState<string | null>(null); // 🪶 Data URL or catalog path.
  const [garment, setGarment] = useState(0);
  const [height, setHeight] = useState("104");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const size = useMemo(() => sizeForHeight(Number(height) || 0), [height]);

  function onUpload(file: File) {
    if (!file.type.startsWith("image/"))
      return toast("فقط فایل تصویری (JPG/PNG)");
    const reader = new FileReader();
    reader.onload = () => {
      setPerson(String(reader.result));
      setResult(null);
      setPhase("idle");
    };
    reader.readAsDataURL(file);
  }

  async function runTryOn() {
    if (!person) return toast("اول یک عکس یا مدل نمونه انتخاب کنید");
    setPhase("running");
    setResult(null);
    try {
      const start = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelImage: person,
          garmentImage: CORE_PRODUCTS[garment].img,
        }),
      });
      const started = await start.json();
      if (!start.ok)
        throw new Error(started.error || "شروع پرو مجازی ناموفق بود.");

      // 🔁 Free mode returns an image now; paid mode returns a job id.
      if (started.image) {
        setResult(started.image);
        setPhase("done");
        toast("پرو مجازی آماده شد ✨");
        return;
      }
      if (!started.id)
        throw new Error(started.error || "پاسخ نامعتبر از سرویس.");

      const deadline = Date.now() + 90_000;
      while (Date.now() < deadline) {
        await sleep(2000);
        const poll = await fetch(`/api/tryon?id=${started.id}`);
        const state = await poll.json();
        if (state.status === "completed" && state.image) {
          setResult(state.image);
          setPhase("done");
          toast("پرو مجازی آماده شد ✨");
          return;
        }
        if (state.status === "failed")
          throw new Error(state.error || "تولید تصویر ناموفق بود.");
      }
      throw new Error("پردازش طولانی شد؛ لطفاً دوباره تلاش کنید.");
    } catch (e) {
      setPhase("error");
      toast((e as Error).message);
    }
  }

  const shown = result ?? person;

  return (
    <div className="xs:px-4 container mx-auto grid w-full max-w-6xl gap-8 px-3 sm:px-5 lg:grid-cols-2 lg:px-7">
      {/* 🖼️ Live preview panel. */}
      <div
        className={cn(
          "rounded-[28px] p-5",
          "border-navy/10 border bg-white",
          "dark:border-gold/30 dark:bg-dusk",
        )}
      >
        <div className="flex items-center justify-between">
          <p className="text-gold text-xs font-black">پیش‌نمایش زنده</p>
          {result ? (
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-black",
                "bg-gold/15 text-gold-deep",
                "dark:text-gold-soft",
              )}
            >
              ساخته‌شده با هوش مصنوعی
            </span>
          ) : null}
        </div>

        <div className="bg-sand relative mt-3 aspect-4/5 overflow-hidden rounded-2xl">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element -- 🪶 Data URLs need a raw img.
            <img
              src={shown}
              alt="پیش‌نمایش پرو مجازی"
              className="size-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <p className="text-navy dark:text-ivory font-black">
                آماده دریافت عکس
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                عکس تمام‌قد کوچولو، یا یک مدل نمونه را انتخاب کنید.
              </p>
            </div>
          )}

          {/* ✨ Progress overlay while AI is running. */}
          {phase === "running" ? (
            <div
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center gap-3 backdrop-blur-sm",
                "bg-navy-deep/70",
              )}
            >
              <Loader2 className="text-gold size-8 animate-spin" />
              <p className="text-ivory text-sm font-black">
                هوش مصنوعی در حال پرو کردن لباس…
              </p>
              <p className="text-wheat text-[11px]">معمولاً ۱۰ تا ۴۰ ثانیه</p>
            </div>
          ) : null}

          {/* current garment chip */}
          {}
          <Image
            src={CORE_PRODUCTS[garment].img}
            alt=""
            width={80}
            height={96}
            className={cn(
              "absolute inset-e-3 bottom-3 h-24 w-20 rounded-xl object-cover shadow-lg",
              "border-2 border-white",
            )}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
          />
          <Button
            type="button"
            variant="secondary"
            className="flex-1 rounded-full"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="size-4" /> آپلود عکس
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-full"
            disabled={!person || phase === "running"}
            onClick={runTryOn}
          >
            {phase === "running" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            پرو با هوش مصنوعی
          </Button>
          {result ? (
            <Button asChild variant="ghost" className="rounded-full">
              <a href={result} download target="_blank" rel="noreferrer">
                <Download className="size-4" /> دانلود
              </a>
            </Button>
          ) : null}
        </div>

        {/* sample models — no need to upload a child's photo to try the feature */}
        <p className="text-navy/70 dark:text-wheat mt-4 text-[11px] font-black">
          یا یک مدل نمونه:
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SAMPLE_MODELS.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => {
                setPerson(src);
                setResult(null);
                setPhase("idle");
              }}
              aria-label={`مدل نمونه ${i + 1}`}
              aria-pressed={person === src}
              className={swatchClass(person === src)}
            >
              {}
              <Image
                src={src}
                alt=""
                width={56}
                height={72}
                className="h-18 w-14 object-cover"
              />
            </button>
          ))}
        </div>

        <p className="text-muted-foreground mt-4 text-[11px] leading-6">
          حریم خصوصی: عکس فقط برای ساخت همین پیش‌نمایش به سرویس هوش مصنوعی ارسال
          می‌شود و نزد ما ذخیره نمی‌گردد. آپلود عکس کودک با رضایت والدین انجام
          شود.
        </p>
      </div>

      {/* 👕 Garment and size controls. */}
      <div>
        <h2
          className={cn(
            "mb-3 flex items-center gap-2 text-lg font-black",
            "text-navy",
            "dark:text-ivory",
          )}
        >
          <Shirt className="text-gold size-5" /> لباس کالکشن
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {CORE_PRODUCTS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setGarment(i)}
              aria-pressed={garment === i}
              className={swatchClass(garment === i)}
            >
              {}
              <Image
                src={p.img}
                alt={p.name}
                width={60}
                height={80}
                className="aspect-3/4 w-full object-cover"
              />
            </button>
          ))}
        </div>

        <div
          className={cn(
            "mt-6 space-y-3 rounded-3xl p-5",
            "border-navy/10 border bg-white",
            "dark:border-gold/30 dark:bg-dusk",
          )}
        >
          <h2 className="text-navy dark:text-ivory font-black">
            اندازه برای پیشنهاد سایز
          </h2>
          <div>
            <Label htmlFor="h">قد (سانتی‌متر)</Label>
            <Input
              id="h"
              inputMode="numeric"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="mt-1 rounded-2xl"
            />
          </div>
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm font-black",
              "bg-gold/10 text-gold-deep",
              "dark:text-gold-soft",
            )}
          >
            سایز پیشنهادی: {size}
          </div>
        </div>
      </div>
    </div>
  );
}
