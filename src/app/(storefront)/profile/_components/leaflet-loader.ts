"use client";

// 🗺️ Plain Leaflet — free and keyless (OSM tiles, Nominatim geocoding).
// ⚡ Dynamic import only — Leaflet touches window/document, never safe at module scope during SSR.
let loading: Promise<typeof import("leaflet")> | null = null;

// 🗺️ Loads Leaflet exactly once, wherever it's called from
export function loadLeaflet(): Promise<typeof import("leaflet")> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("فقط در مرورگر قابل استفاده است."));
  }
  if (loading) return loading;

  loading = import("leaflet").then((mod) => mod.default ?? mod);
  return loading;
}
