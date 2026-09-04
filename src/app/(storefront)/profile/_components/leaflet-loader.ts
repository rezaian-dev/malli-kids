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

// 📍 A small brand-matched pin — navy teardrop, gold ring, paper-white
// center — instead of Leaflet's plain default marker. Colors are the same
// `--color-navy`/`--color-gold`/`--color-paper` tokens as the rest of the
// app (`theme.css`); kept as literal hex here since this markup never
// passes through Tailwind, just Leaflet's own `divIcon`.
const PIN_SVG = `
<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M15 0C6.7 0 0 6.7 0 15c0 11.2 15 25 15 25s15-13.8 15-25C30 6.7 23.3 0 15 0z" fill="#0e2a47"/>
  <circle cx="15" cy="15" r="9.5" fill="#fffefb"/>
  <circle cx="15" cy="15" r="6.5" fill="#c19357"/>
</svg>`.trim();

/** The one pin icon this map ever places — pass it to every `L.marker(...)`
 *  call so a fresh marker always matches the brand instead of briefly
 *  showing Leaflet's default blue-teardrop image (or nothing, if that
 *  image's URL ever 404s).
 *
 *  🩹 The SVG is wrapped in its own `.marker-bounce` div rather than sitting
 *  directly on the icon root. Leaflet positions the icon root itself via an
 *  inline `transform: translate3d(...)`; the drop-bounce animation
 *  (triggered from `address-map-field.tsx`) also animates `transform`, and
 *  applying both to the same element makes the animation's `transform` win
 *  — after it finishes (its `both` fill-mode freezes the last keyframe) the
 *  marker keeps that instead of Leaflet's translate3d, so it visually jumps
 *  to the map's transform origin and looks like it vanished. Animating the
 *  inner wrapper keeps the two transforms on separate elements. */
export function createPinIcon(L: typeof import("leaflet")) {
  return L.divIcon({
    html: `<div class="marker-bounce drop-shadow-[0_8px_10px_rgba(4,20,39,0.45)]">${PIN_SVG}</div>`,
    className: "",
    iconSize: [30, 40],
    iconAnchor: [15, 40],
  });
}
