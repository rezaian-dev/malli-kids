"use client";

// 🗺️ Neshan's Leaflet build isn't a normal npm package — it's their own
// self-hosted, patched Leaflet, loaded on demand (the same approach their
// own SDKs use: no `<script>` tag on every page, it loads the first time a
// map actually opens). Once loaded, `window.L` is a full standard Leaflet
// `L` namespace — `L.marker`, `.addTo`, `map.on("click", ...)`, `flyTo`,
// `setView`, dragging — plus `key`/`maptype`/`poi`/`traffic` recognized as
// extra options on `new L.Map(el, options)`.
//
// `@types/leaflet` is a dev-only *type* dependency here (see `package.json`)
// — it never ships any runtime code; only its `.d.ts` shapes are used to
// type `window.L`, which is Neshan's SDK, not the npm `leaflet` package.
const SDK_VERSION = "1.4.0";
const JS_URL = `https://static.neshan.org/sdk/leaflet/${SDK_VERSION}/leaflet.js`;
const CSS_URL = `https://static.neshan.org/sdk/leaflet/${SDK_VERSION}/leaflet.css`;

declare global {
  interface Window {
    L?: typeof import("leaflet");
  }
}

let loading: Promise<typeof import("leaflet")> | null = null;

function injectCss() {
  if (document.querySelector(`link[href="${CSS_URL}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = CSS_URL;
  document.head.appendChild(link);
}

/** Loads Neshan's Leaflet SDK exactly once no matter how many times/where
 *  it's called from — later calls resolve from the same cached promise
 *  (or instantly, once `window.L` already exists). */
export function loadNeshanLeaflet(): Promise<typeof import("leaflet")> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("فقط در مرورگر قابل استفاده است."));
  }
  if (window.L) return Promise.resolve(window.L);
  if (loading) return loading;

  injectCss();
  loading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = JS_URL;
    script.async = true;
    script.onload = () => {
      if (window.L) resolve(window.L);
      else reject(new Error("نقشه بارگذاری نشد؛ دوباره تلاش کنید."));
    };
    script.onerror = () => {
      loading = null; // 🔁 let a retry actually re-fetch instead of hanging.
      reject(new Error("نقشه بارگذاری نشد؛ اتصال اینترنت را بررسی کنید."));
    };
    document.head.appendChild(script);
  });
  return loading;
}
