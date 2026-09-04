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
// `useEffect` in `AddressMapField`.
let loading: Promise<typeof import("leaflet")> | null = null;

/** Loads the `leaflet` package exactly once no matter how many times/where
 *  it's called from. */
export function loadLeaflet(): Promise<typeof import("leaflet")> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("فقط در مرورگر قابل استفاده است."));
  }
  if (loading) return loading;

  loading = import("leaflet").then((mod) => mod.default ?? mod);
  return loading;
}
