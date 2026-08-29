"use client";

import Image from "next/image";

import { useMemo, useRef, useState } from "react";
import { Download, Loader2, Shirt, Sparkles, Upload } from "lucide-react";
import { CORE_PRODUCTS } from "@/lib/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
type Phase = "idle" | "running" | "done" | "error";

// A few catalog kid photos double as ready-made "sample models" so a parent can
// try the feature without uploading a photo of their own child.
const SAMPLE_MODELS = CORE_PRODUCTS.slice(0, 4).map((p) => p.img);

function sizeForHeight(h: number): string {
  const table: [number, string][] = [
    [80, "۸۰"], [86, "۸۶"], [92, "۹۲"], [98, "۹۸"], [104, "۱۰۴"], [110, "۱۱۰"], [116, "۱۱۶"],
  ];
  for (const [max, label] of table) if (h < max) return label;
  return "۱۲۲";
}

export function Studio() {
  const [person, setPerson] = useState<string | null>(null); // data URI or catalog path
  const [garment, setGarment] = useState(0);
  const [height, setHeight] = useState("104");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const size = useMemo(() => sizeForHeight(Number(height) || 0), [height]);

  function onUpload(file: File) {
    if (!file.type.startsWith("image/")) return toast("فقط فایل تصویری (JPG/PNG)");
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
        body: JSON.stringify({ modelImage: person, garmentImage: CORE_PRODUCTS[garment].img }),
      });
      const started = await start.json();
      if (!start.ok) throw new Error(started.error || "شروع پرو مجازی ناموفق بود.");

      // Free provider returns the image directly; paid provider returns an id to poll.
      if (started.image) {
        setResult(started.image);
        setPhase("done");
        toast("پرو مجازی آماده شد ✨");
        return;
      }
      if (!started.id) throw new Error(started.error || "پاسخ نامعتبر از سرویس.");

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
        if (state.status === "failed") throw new Error(state.error || "تولید تصویر ناموفق بود.");
      }
      throw new Error("پردازش طولانی شد؛ لطفاً دوباره تلاش کنید.");
    } catch (e) {
      setPhase("error");
      toast((e as Error).message);
    }
  }

  const shown = result ?? person;

  return (
    <div className="container mx-auto grid w-full max-w-6xl gap-8 px-4 sm:px-5 lg:grid-cols-2 lg:px-7">
      {/* Preview */}
      <div className="rounded-[28px] border border-navy/10 bg-white p-5 dark:border-gold/30 dark:bg-dusk">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black text-gold">پیش‌نمایش زنده</p>
          {result ? <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-black text-gold-deep dark:text-gold-soft">ساخته‌شده با هوش مصنوعی</span> : null}
        </div>

        <div className="relative mt-3 aspect-4/5 overflow-hidden rounded-2xl bg-sand">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="پیش‌نمایش پرو مجازی" className="size-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <p className="font-black text-navy dark:text-ivory">آماده دریافت عکس</p>
              <p className="mt-2 text-sm text-muted-foreground">عکس تمام‌قد کوچولو، یا یک مدل نمونه را انتخاب کنید.</p>
            </div>
          )}

          {/* running overlay */}
          {phase === "running" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-navy-deep/70 backdrop-blur-sm">
              <Loader2 className="size-8 animate-spin text-gold" />
              <p className="text-sm font-black text-ivory">هوش مصنوعی در حال پرو کردن لباس…</p>
              <p className="text-[11px] text-wheat">معمولاً ۱۰ تا ۴۰ ثانیه</p>
            </div>
          ) : null}

          {/* current garment chip */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Image src={CORE_PRODUCTS[garment].img} alt="" width={80} height={96} className="absolute bottom-3 end-3 h-24 w-20 rounded-xl border-2 border-white object-cover shadow-lg" />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
          <Button type="button" variant="secondary" className="flex-1 rounded-full" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" /> آپلود عکس
          </Button>
          <Button type="button" className="flex-1 rounded-full" disabled={!person || phase === "running"} onClick={runTryOn}>
            {phase === "running" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
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
        <p className="mt-4 text-[11px] font-black text-navy/50 dark:text-wheat">یا یک مدل نمونه:</p>
        <div className="mt-2 flex gap-2">
          {SAMPLE_MODELS.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => {
                setPerson(src);
                setResult(null);
                setPhase("idle");
              }}
              className={`overflow-hidden rounded-xl border-2 transition ${person === src ? "border-gold" : "border-transparent hover:border-gold/40"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image src={src} alt="مدل نمونه" width={56} height={72} className="h-18 w-14 object-cover" />
            </button>
          ))}
        </div>

        <p className="mt-4 text-[11px] leading-6 text-muted-foreground">
          حریم خصوصی: عکس فقط برای ساخت همین پیش‌نمایش به سرویس هوش مصنوعی ارسال می‌شود و نزد ما ذخیره نمی‌گردد. آپلود عکس کودک با رضایت والدین انجام شود.
        </p>
      </div>

      {/* Garment + size */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-navy dark:text-ivory">
          <Shirt className="size-5 text-gold" /> لباس کالکشن
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {CORE_PRODUCTS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setGarment(i)}
              className={`overflow-hidden rounded-xl border-2 transition ${garment === i ? "border-gold" : "border-transparent hover:border-gold/40"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image src={p.img} alt={p.name} width={60} height={80} className="aspect-3/4 w-full object-cover" />
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3 rounded-3xl border border-navy/10 bg-white p-5 dark:border-gold/30 dark:bg-dusk">
          <h2 className="font-black text-navy dark:text-ivory">اندازه برای پیشنهاد سایز</h2>
          <div>
            <Label htmlFor="h">قد (سانتی‌متر)</Label>
            <Input id="h" inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value)} className="mt-1 rounded-2xl" />
          </div>
          <div className="rounded-2xl bg-gold/10 px-4 py-3 text-sm font-black text-gold-deep dark:text-gold-soft">
            سایز پیشنهادی: {size}
          </div>
        </div>
      </div>
    </div>
  );
}
