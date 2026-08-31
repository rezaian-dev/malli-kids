"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  value?: string;
  /** 🪶 Ready-to-store compressed image data. */
  onChange: (dataUrl: string) => void;
  onClear?: () => void;
  variant?: "avatar" | "cover";
  label?: string;
  fallback?: ReactNode;
  /** 🪶 Target size after compression in MB. */
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  className?: string;
};

/** 🪶 Compress a picked image into a light data URL. */
export async function compressToDataUrl(
  file: File,
  opts?: { maxSizeMB?: number; maxWidthOrHeight?: number },
): Promise<string> {
  const compressed = await imageCompression(file, {
    maxSizeMB: opts?.maxSizeMB ?? 0.8,
    maxWidthOrHeight: opts?.maxWidthOrHeight ?? 1280,
    useWebWorker: true,
    fileType: "image/webp",
  });
  return imageCompression.getDataUrlFromFile(compressed);
}

/** 🖼️ Reusable image picker with client-side compression. */
export function ImageUpload({
  value,
  onChange,
  onClear,
  variant = "cover",
  label = "عکس را بکشید و رها کنید، یا کلیک کنید",
  fallback,
  maxSizeMB = 0.8,
  maxWidthOrHeight = 1280,
  className,
}: Props) {
  const [busy, setBusy] = useState(false);
  const isAvatar = variant === "avatar";

  const onDrop = useCallback(
    async (accepted: File[], rejected: unknown[]) => {
      if (rejected.length) return toast("فقط فایل تصویری (JPG/PNG/WebP)");
      const file = accepted[0];
      if (!file) return;
      setBusy(true);
      try {
        onChange(
          await compressToDataUrl(file, { maxSizeMB, maxWidthOrHeight }),
        );
      } catch {
        toast("پردازش عکس ناموفق بود؛ دوباره تلاش کنید.");
      } finally {
        setBusy(false);
      }
    },
    [onChange, maxSizeMB, maxWidthOrHeight],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    disabled: busy,
  });

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        role="button"
        aria-label="آپلود عکس"
        className={cn(
          "group relative flex cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed text-center transition",
          isDragActive
            ? "border-gold bg-gold/10"
            : "border-navy/20 hover:border-gold/50 dark:border-gold/30",
          isAvatar ? "size-28 rounded-full" : "aspect-video w-full rounded-2xl",
          value ? "border-solid" : "dark:bg-navy-mid/50 bg-white/60",
        )}
      >
        <input {...getInputProps()} />

        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- 🪶 Local previews can use a raw img.
          <img
            src={value}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        ) : fallback ? (
          fallback
        ) : (
          <div className="p-4">
            {isAvatar ? (
              <ImagePlus className="text-gold mx-auto size-6" />
            ) : (
              <Upload className="text-gold mx-auto size-7" />
            )}
            {!isAvatar ? (
              <p className="text-navy/60 dark:text-wheat mt-2 text-xs font-bold">
                {label}
              </p>
            ) : null}
          </div>
        )}

        {/* hover hint when an image already exists */}
        {value && !busy ? (
          <div className="bg-navy-deep/40 absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
            <Upload className="text-ivory size-6" />
          </div>
        ) : null}

        {busy ? (
          <div className="bg-navy-deep/60 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="text-gold size-6 animate-spin" />
          </div>
        ) : null}
      </div>

      {value && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="text-rose mt-2 inline-flex items-center gap-1 text-[11px] font-black hover:underline"
        >
          <Trash2 className="size-3.5" /> حذف عکس
        </button>
      ) : null}
    </div>
  );
}
