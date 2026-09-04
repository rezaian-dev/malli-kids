"use client";

// 🗺️ Plain, free Leaflet — no account, no API key, nothing to configure.
// Replaces the old Neshan-hosted SDK (see git history), which needed two
// paid/keyed services (map tiles + reverse geocoding) that were never
// actually configured in this app's `.env`, which is exactly why the map
// never loaded. Tiles come from Esri's free `World_Street_Map` service
// (see `address-map-field.tsx`) and reverse geocoding from OSM's Nominatim
// (see `reverseGeocodeAction`) — both still free/keyless, just no longer
// the same single OSM tile server for both.
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
