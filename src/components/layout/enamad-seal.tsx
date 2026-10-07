"use client";

import { useCallback, useState } from "react";

/**
 * Official Iranian e-commerce trust seal — نماد اعتماد الکترونیکی.
 *
 * Placement rules from https://enamad.ir/logohelp that shape this component:
 *  • the image must be requested by the browser straight from
 *    trustseal.enamad.ir (their endpoint validates the domain through the
 *    `Referrer` header), so this is a plain <img> — proxying it through
 *    next/image would hide the visitor's origin behind /_next/image;
 *  • `rel="noreferrer"` must never sit on the link — it strips the referrer
 *    and enamad then drops the seal;
 *  • the seal must not be lazy-loaded;
 *  • the snippet is kept unmodified, including the custom `code` attribute.
 */
const ENAMAD_ID = "7802981";
const ENAMAD_CODE = "BRRTzAc1yrdhfQQGEa4o2Awy3ePVvqgY";
const ENAMAD_HREF = `https://trustseal.enamad.ir/?id=${ENAMAD_ID}&Code=${ENAMAD_CODE}`;
const ENAMAD_SRC = `https://trustseal.enamad.ir/logo.aspx?id=${ENAMAD_ID}&Code=${ENAMAD_CODE}`;

/** Local spare, used only if trustseal.enamad.ir itself is unreachable. */
const FALLBACK_SRC = "/brand/enamad.png";

/**
 * `code` is a non-standard attribute carried over from the official snippet —
 * enamad's own widget script reads it back off the element.
 */
const SNIPPET_ATTRS = {
  code: ENAMAD_CODE,
} as unknown as React.ImgHTMLAttributes<HTMLImageElement>;

export function EnamadSeal({ className }: { className?: string }) {
  const [src, setSrc] = useState(ENAMAD_SRC);

  // The seal can fail before hydration (slow/blocked trustseal.enamad.ir), so
  // re-check the element once React attaches instead of relying on onError.
  const measure = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth === 0) setSrc(FALLBACK_SRC);
  }, []);

  return (
    <a
      href={ENAMAD_HREF}
      target="_blank"
      referrerPolicy="origin"
      // `noopener` keeps the new tab sandboxed; `noreferrer` would break enamad.
      rel="noopener"
      aria-label="نماد اعتماد الکترونیکی (اینماد) — باز شدن در پنجرهٔ جدید"
      className={className}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={measure}
        src={src}
        alt="نماد اعتماد الکترونیکی"
        width={125}
        height={125}
        loading="eager"
        decoding="async"
        referrerPolicy="origin"
        {...SNIPPET_ATTRS}
        onError={() => setSrc(FALLBACK_SRC)}
        className="size-full object-contain"
      />
    </a>
  );
}
