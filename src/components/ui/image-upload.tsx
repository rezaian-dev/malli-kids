"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  value?: string;
  /** Receives a compressed data-URL ready to store (or POST to an upload route). */
  onChange: (dataUrl: string) => void;
  onClear?: () => void;
  variant?: "avatar" | "cover";
  label?: string;
  fallback?: ReactNode;
  /** Target size after compression (MB). Keeps localStorage/base64 small. */
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  className?: string;
};

/** Compress + resize a picked file into a light data-URL (shared by the component and bespoke pickers like the profile avatar). */
export async function compressToDataUrl(file: File, opts?: { maxSizeMB?: number; maxWidthOrHeight?: number }): Promise<string> {
  const compressed = await imageCompression(file, {
    maxSizeMB: opts?.maxSizeMB ?? 0.8,
    maxWidthOrHeight: opts?.maxWidthOrHeight ?? 1280,
    useWebWorker: true,
    fileType: "image/webp",
  });
  return imageCompression.getDataUrlFromFile(compressed);
}

/**
 * Clean, reusable image picker. Handles drag-and-drop + click (react-dropzone),
 * then compresses/resizes on the client (browser-image-compression) so a 5MB
 * phone photo becomes a light data-URL instead of being rejected. The output is
 * storage-agnostic: here it feeds the localStorage-backed store, but the same
 * `onChange(dataUrl)` could POST to an upload route for a real CDN.
 */
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
        onChange(await compressToDataUrl(file, { maxSizeMB, maxWidthOrHeight }));
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
          isDragActive ? "border-gold bg-gold/10" : "border-navy/20 hover:border-gold/50 dark:border-gold/30",
          isAvatar ? "size-28 rounded-full" : "aspect-video w-full rounded-2xl",
          value ? "border-solid" : "bg-white/60 dark:bg-navy-mid/50",
        )}
      >
        <input {...getInputProps()} />

        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="absolute inset-0 size-full object-cover" />
        ) : fallback ? (
          fallback
        ) : (
          <div className="p-4">
            {isAvatar ? <ImagePlus className="mx-auto size-6 text-gold" /> : <Upload className="mx-auto size-7 text-gold" />}
            {!isAvatar ? <p className="mt-2 text-xs font-bold text-navy/60 dark:text-wheat">{label}</p> : null}
          </div>
        )}

        {/* hover hint when an image already exists */}
        {value && !busy ? (
          <div className="absolute inset-0 flex items-center justify-center bg-navy-deep/40 opacity-0 transition group-hover:opacity-100">
            <Upload className="size-6 text-ivory" />
          </div>
        ) : null}

        {busy ? (
          <div className="absolute inset-0 flex items-center justify-center bg-navy-deep/60 backdrop-blur-sm">
            <Loader2 className="size-6 animate-spin text-gold" />
          </div>
        ) : null}
      </div>

      {value && onClear ? (
        <button type="button" onClick={onClear} className="mt-2 inline-flex items-center gap-1 text-[11px] font-black text-rose hover:underline">
          <Trash2 className="size-3.5" /> حذف عکس
        </button>
      ) : null}
    </div>
  );
}
