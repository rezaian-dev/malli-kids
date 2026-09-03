"use client";

// 🗺️ Plain, free Leaflet + OpenStreetMap tiles — no account, no API key,
// nothing to configure. Replaces the old Neshan-hosted SDK (see git
// history), which needed two paid/keyed services (map tiles + reverse
// geocoding) that were never actually configured in this app's `.env`,
// which is exactly why the map never loaded.
//
// The npm `leaflet` package is dynamically imported here (never at module
// scope) so nothing Leaflet does at load time — it touches `window`/
// `document` — ever runs during SSR; this file only ever executes from a
// `useEffect` in the open dialog.
let loading: Promise<typeof import("leaflet")> | null = null;

/** Loads the `leaflet` package exactly once no matter how many times/where
 *  it's called from, and points its default marker icon at real image URLs
 *  — the npm package's own relative asset paths don't resolve once bundled,
 *  a well-known Leaflet-in-a-bundler gotcha. */
export function loadLeaflet(): Promise<typeof import("leaflet")> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("فقط در مرورگر قابل استفاده است."));
  }
  if (loading) return loading;

  loading = import("leaflet").then((mod) => {
    const L = mod.default ?? mod;
    // 🖼️ Copied once from `leaflet/dist/images` into `public/leaflet/` (see
    // git history) so these are same-origin — no CDN dependency, no extra
    // CSP `img-src` entry beyond the OSM tile host itself.
    delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })
      ._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/leaflet/marker-icon-2x.png",
      iconUrl: "/leaflet/marker-icon.png",
      shadowUrl: "/leaflet/marker-shadow.png",
    });
    return L;
  });
  return loading;
}
