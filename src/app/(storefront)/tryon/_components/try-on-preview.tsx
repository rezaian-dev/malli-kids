import Image from "next/image";
import { Download, Loader2, Sparkles, Upload } from "lucide-react";
import { CORE_PRODUCTS } from "@/lib/data/products";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SAMPLE_MODELS, type TryOnPhase } from "../_hooks/use-try-on";

function swatchClass(active: boolean) {
  return cn(
    "overflow-hidden rounded-xl border-2 transition-all duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-95",
    active
      ? "border-gold motion-safe:hover:shadow-md motion-safe:hover:shadow-gold/30"
      : "hover:border-gold/40 border-transparent",
  );
}

/** 🖼️ Live preview + photo upload/sample-model picker + run button. */
export function TryOnPreview({
  person,
  result,
  phase,
  garment,
  fileRef,
  onUpload,
  onRunTryOn,
  onPickSample,
}: {
  person: string | null;
  result: string | null;
  phase: TryOnPhase;
  garment: number;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (file: File) => void;
  onRunTryOn: () => void;
  onPickSample: (src: string) => void;
}) {
  const shown = result ?? person;

  return (
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
          alt={CORE_PRODUCTS[garment].name}
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
          onClick={onRunTryOn}
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
            onClick={() => onPickSample(src)}
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
  );
}
