"use client";

// 🗺️ Leaflet's own stylesheet — scoped to this file (the map's only
// consumer) instead of the storefront's global CSS entry, so it isn't
// shipped as render-blocking CSS on every unrelated page. This component
// only ever mounts inside the profile's already-lazy (`ssr:false`) info
// panel, so the import rides along on that same on-demand chunk.
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useFormContext } from "react-hook-form";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { CheckCircle2, ChevronUp, LocateFixed, MapPin, MapPinned } from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";
import { reverseGeocodeAction } from "../_lib/actions";
import type { UpdateAccountValues } from "../_lib/schemas";
import { loadLeaflet } from "./leaflet-loader";

const PICK_DEBOUNCE_MS = 600;
const TYPE_CHARS_PER_TICK = 2;
const TYPE_TICK_MS = 22;

/** 📍 "انتخاب روی نقشه" — an inline (never a dialog/overlay) map card that
 *  expands right below the address field. No marker shows until the user
 *  actually picks a spot — clicking anywhere on the map (or confirming a
 *  GPS fix) drops a real Leaflet marker exactly there and reverse-geocodes
 *  it into the account form's `address` field (typed in with a small
 *  animation). A previous version instead kept a pin permanently glued to
 *  the map's visual center, picking up whatever was under it on every pan —
 *  dropped in favor of this explicit click-to-place model. Reads and writes
 *  `lat`/`lng`/`address` straight off the surrounding `<AppForm>`'s
 *  react-hook-form context — those three only ever get committed together
 *  when the user presses "تأیید", and only really saved once "ذخیره حساب"
 *  is submitted like every other account field. */
export function AddressMapField() {
  const { watch, setValue, getValues } = useFormContext<UpdateAccountValues>();
  const lat = watch("lat");
  const lng = watch("lng");

  const [open, setOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [typing, setTyping] = useState(false);
  // ✨ Bumped once each time the typewriter finishes a full pass — keyed
  // onto the success checkmark below so its pop-in animation replays every
  // time a new address lands, not just the first.
  const [doneTick, setDoneTick] = useState(0);
  const [preview, setPreview] = useState("");
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  // 🎯 Set once the map's ready, so `handleLocate` (defined outside the
  // map-building effect, no access to that effect's own `L`/`map` closure)
  // can still drop/move the marker after a GPS fix.
  const placeMarkerRef = useRef<((lat: number, lng: number) => void) | null>(
    null,
  );
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const keydownHandlerRef = useRef<((e: KeyboardEvent) => void) | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typeTargetRef = useRef("");

  // 🧊 Plain functions, not `useCallback` — none of these are ever compared
  // by reference (not a `useEffect`/`useMemo` dependency, not passed to a
  // memoized child; the map-building effect below intentionally closes over
  // whatever version of `handlePick` exists when it runs, via its own
  // `[open]`-only dependency array), so memoizing them buys nothing.
  function stopTyping() {
    if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    typeIntervalRef.current = null;
    setTyping(false);
  }

  function startTypewriter(text: string) {
    stopTyping();
    typeTargetRef.current = text;
    setPreview("");
    setTyping(true);
    let shown = 0;
    typeIntervalRef.current = setInterval(() => {
      shown += TYPE_CHARS_PER_TICK;
      setPreview(text.slice(0, shown));
      if (shown >= text.length) {
        stopTyping();
        setDoneTick((n) => n + 1);
      }
    }, TYPE_TICK_MS);
  }

  // ⏩ Editing the preview mid-animation (or just wanting the full text
  // instantly) should feel responsive, not fight the typewriter.
  function finishTypingNow() {
    if (!typeIntervalRef.current) return;
    stopTyping();
    setPreview(typeTargetRef.current);
    setDoneTick((n) => n + 1);
  }

  async function runGeocode(nextLat: number, nextLng: number) {
    setGeocoding(true);
    const result = await reverseGeocodeAction({ lat: nextLat, lng: nextLng });
    setGeocoding(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    startTypewriter(result.data.address);
  }

  // 📌 Called once per explicit selection — a map click or a confirmed GPS
  // fix — never from a plain pan/zoom, which no longer picks anything.
  function handlePick(nextLat: number, nextLng: number) {
    setPicked({ lat: nextLat, lng: nextLng });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => runGeocode(nextLat, nextLng),
      PICK_DEBOUNCE_MS,
    );
  }

  function handleLocate() {
    if (!navigator.geolocation) {
      toast.error("مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const map = mapRef.current;
        if (!map) return;
        // 🎯 GPS is itself an explicit selection — unlike a plain pan, it
        // picks the point it flies to. `once` (not `on`) so this doesn't
        // also fire for whatever the user pans to next.
        map.once("moveend", () => {
          const c = map.getCenter();
          placeMarkerRef.current?.(c.lat, c.lng);
          handlePick(c.lat, c.lng);
        });
        map.flyTo(
          [pos.coords.latitude, pos.coords.longitude],
          Math.max(map.getZoom(), 16),
          { duration: 0.9 },
        );
      },
      (err) => {
        setLocating(false);
        const msg =
          err.code === err.PERMISSION_DENIED
            ? "دسترسی به موقعیت مکانی رد شد؛ از تنظیمات مرورگر اجازه بدهید."
            : err.code === err.TIMEOUT
              ? "پیدا کردن موقعیت طول کشید؛ دوباره تلاش کنید."
              : "موقعیت مکانی پیدا نشد.";
        toast.error(msg);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 },
    );
  }

  // 🗺️ Build a fresh map every time the card opens, tear it down when it
  // closes — simpler and safer than trying to keep one Leaflet instance
  // alive through a `display:none`/unmount cycle.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setMapReady(false);
    setMapError(null);

    const existingLat = getValues("lat");
    const existingLng = getValues("lng");
    const hasExisting = existingLat != null && existingLng != null;
    const startLat = existingLat ?? BRAND.map.lat;
    const startLng = existingLng ?? BRAND.map.lng;
    // 📍 A previously-saved location *is* already a selection — show its
    // marker right away. Otherwise nothing's been picked yet, so no marker
    // (and no `picked`) until the user actually clicks the map or uses GPS.
    setPicked(hasExisting ? { lat: existingLat, lng: existingLng } : null);
    setPreview(getValues("address") ?? "");
    typeTargetRef.current = getValues("address") ?? "";

    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapElRef.current) return;
        const map = new L.Map(mapElRef.current, {
          center: [startLat, startLng],
          zoom: 15,
        });
        // 🆓 Esri's public "World Street Map" tile service — free, no key,
        // no signup, same as the OSM tile server this replaced (see git
        // history). That switch was forced, not stylistic: OSM's own
        // `tile.openstreetmap.org` enforces a strict, unappealable
        // automated tile-usage policy and had started silently serving its
        // "Access blocked" placeholder tile (still HTTP 200, so Leaflet
        // never saw an error — every tile "loaded" successfully and just
        // rendered blank) instead of real imagery to this app's traffic —
        // see https://operations.osmfoundation.org/policies/tiles/. Esri's
        // tile path is `{z}/{y}/{x}` (y before x — the reverse of the
        // `{z}/{x}/{y}` every other provider, OSM included, uses).
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 19,
            attribution:
              'Tiles © <a href="https://www.esri.com" target="_blank" rel="noreferrer">Esri</a> — Source: Esri, HERE, Garmin, © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
          },
        ).addTo(map);

        // 📍 A real Leaflet marker, created lazily on the first selection
        // (or immediately below, if a location was already saved) and just
        // moved on every one after — never re-created, so it doesn't flash.
        function placeMarker(nextLat: number, nextLng: number) {
          if (markerRef.current) {
            markerRef.current.setLatLng([nextLat, nextLng]);
            return;
          }
          markerRef.current = L.marker([nextLat, nextLng], {
            // 🎨 Rendered from the same lucide icon the old fixed overlay
            // used, so the pin looks identical — it's just a real marker
            // tied to a coordinate now, not viewport-center chrome.
            icon: L.divIcon({
              html: renderToStaticMarkup(
                <MapPinned
                  strokeWidth={1.75}
                  className="text-navy fill-gold size-9 drop-shadow-[0_10px_10px_rgba(4,20,39,0.4)] dark:text-gold-light dark:fill-navy"
                />,
              ),
              className: "", // 🧹 drops Leaflet's default white-box marker styling
              iconSize: [36, 36],
              iconAnchor: [18, 34],
            }),
            keyboard: false, // the map container itself carries keyboard selection, below
            interactive: false,
          }).addTo(map);
        }
        placeMarkerRef.current = placeMarker;
        if (hasExisting) placeMarker(existingLat, existingLng);

        // 🖱️ Click drops (or moves) the marker exactly where clicked and
        // picks that point — no more "fly the click to center" detour.
        map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
          placeMarker(e.latlng.lat, e.latlng.lng);
          handlePick(e.latlng.lat, e.latlng.lng);
        });

        // ♿️ Keyboard equivalent of a click: Leaflet already lets a
        // focused map pan via the arrow keys, so Enter/Space here picks
        // whatever's currently centered — no mouse required.
        function onKeyDown(e: KeyboardEvent) {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          const c = map.getCenter();
          placeMarker(c.lat, c.lng);
          handlePick(c.lat, c.lng);
        }
        mapElRef.current.addEventListener("keydown", onKeyDown);
        keydownHandlerRef.current = onKeyDown;

        mapRef.current = map;
        setMapReady(true);
        // 🩹 Leaflet measures its container once at init; the card is still
        // mid-expand at that point (`grid-template-rows` animating 0fr→1fr
        // over 300ms above), so a one-shot `invalidateSize()` timed to any
        // fixed delay either fires too early (mid-transition size — tiles
        // load but land in the wrong place, leaving the real viewport
        // blank) or leaves a visible pop once it *does* fire late. A
        // `ResizeObserver` instead re-syncs Leaflet's internal size on
        // every frame of that transition (it also fires once immediately
        // on `observe()`, and keeps working for any later resize) — no
        // guessed delay needed.
        const ro = new ResizeObserver(() => map.invalidateSize());
        ro.observe(mapElRef.current);
        resizeObserverRef.current = ro;
      })
      .catch((e: Error) => {
        if (!cancelled) setMapError(e.message);
      });

    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      stopTyping();
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      if (keydownHandlerRef.current) {
        mapElRef.current?.removeEventListener(
          "keydown",
          keydownHandlerRef.current,
        );
        keydownHandlerRef.current = null;
      }
      placeMarkerRef.current = null;
      markerRef.current = null; // 🗑️ destroyed along with the map below, not separately
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 🎯 only re-run on open/close.
  }, [open]);

  function handleConfirm() {
    // ♿️ `picked` (the last clicked/GPS'd/Enter-selected point) is the
    // fast path, but lat/lng are optional on the account schema — a
    // keyboard user who'd rather not touch the map at all can still tab
    // into this card's textarea below, edit the address text, and confirm
    // without ever selecting a point.
    if (!picked && !preview.trim()) {
      toast.warning("اول روی نقشه کلیک کنید یا آدرس را تایپ کنید.");
      return;
    }
    if (picked) {
      setValue("lat", picked.lat, { shouldDirty: true });
      setValue("lng", picked.lng, { shouldDirty: true });
    }
    if (preview.trim()) {
      setValue("address", preview.trim(), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    toast.success(
      picked
        ? "موقعیت روی نقشه ثبت شد — برای ذخیرهٔ نهایی «ذخیره حساب» را بزنید."
        : "آدرس ثبت شد — برای ذخیرهٔ نهایی «ذخیره حساب» را بزنید.",
    );
    setOpen(false);
  }

  const hasPin = Boolean(lat && lng);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <ChevronUp className="size-3.5" /> : <MapPin className="size-3.5" />}
          {open ? "بستنِ نقشه" : hasPin ? "ویرایش موقعیت روی نقشه" : "انتخاب روی نقشه"}
        </Button>

        {hasPin && !open ? (
          <span className="animate-fade-up bg-gold/10 text-navy dark:text-gold-light inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold">
            <MapPin className="size-3" /> موقعیت روی نقشه ثبت شده
          </span>
        ) : null}
      </div>

      {/* 📥 Inline expand/collapse, no dialog/overlay/portal — the same
          `grid-template-rows` 0fr↔1fr trick `Field`'s own error message
          uses (see `components/form/field.tsx`), so it never needs to know
          the map card's real height up front. */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(.25,.1,.25,1)]",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={cn(
              "space-y-3 rounded-2xl border p-3 sm:p-4",
              "border-navy/10 bg-sand/40",
              "dark:border-gold/20 dark:bg-navy-deep/30",
            )}
          >
            <p className="text-navy/70 dark:text-wheat text-xs leading-6">
              روی نقطهٔ موردنظر روی نقشه کلیک کنید تا نشانگر همان‌جا قرار
              بگیرد؛ آدرس متنی خودکار پر می‌شود.
            </p>

            <div className="bg-sand relative h-72 w-full overflow-hidden rounded-2xl sm:h-80">
              {/* 🩹 The opacity fade is on this *wrapper*, not on the div
                  Leaflet mounts onto below. `new L.Map(el)` adds its own
                  classes (`leaflet-container`, …) straight to `el.className`
                  outside React's knowledge; if that same element also had a
                  React-controlled `className` that changes when `mapReady`
                  flips true (as this used to), React's very next re-render
                  overwrites `el.className` wholesale and silently wipes
                  every class Leaflet just added — a race that (depending on
                  exactly when that re-render lands relative to Leaflet's own
                  work) could leave the map partially or completely
                  unstyled. The inner div's `className` below is now a
                  constant literal, so React never has a reason to touch it
                  again after the first paint. */}
              <div
                className={cn(
                  "absolute inset-0 opacity-0 transition-opacity duration-500",
                  mapReady && "opacity-100",
                )}
              >
                <div
                  ref={mapElRef}
                  role="group"
                  aria-label="نقشه‌ی انتخاب موقعیت — روی نقطهٔ موردنظر کلیک کنید تا نشانگر همان‌جا قرار بگیرد؛ یا با کلیدهای جهت‌دار نقشه را جابه‌جا و با اینتر همان نقطهٔ مرکز را انتخاب کنید. برای واردکردن آدرس با صفحه‌کلید می‌توانید از فیلد «آدرس یافت‌شده» زیر نقشه هم استفاده کنید"
                  className="absolute inset-0"
                />
              </div>

              {!mapReady && !mapError ? (
                <div
                  aria-hidden
                  className="from-sand via-gold-pale/40 to-sand absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-linear-to-br dark:from-navy-deep dark:via-navy-mid/60 dark:to-navy-deep"
                >
                  <span className="relative">
                    <span className="bg-gold/25 absolute inset-0 -m-2 animate-ping rounded-full" />
                    <span className="bg-navy text-gold-soft relative grid size-11 place-items-center rounded-full shadow-lg dark:bg-gold dark:text-navy-deep">
                      <MapPin className="size-5" />
                    </span>
                  </span>
                  <span className="text-navy/70 dark:text-ivory/70 rounded-full bg-white/60 px-3 py-1 text-[11px] font-bold dark:bg-white/10">
                    در حال بارگذاری نقشه…
                  </span>
                </div>
              ) : null}
              {mapError ? (
                <div className="text-rose absolute inset-0 flex items-center justify-center px-6 text-center text-xs font-bold">
                  {mapError}
                </div>
              ) : null}

              <Button
                type="button"
                variant="navy"
                size="sm"
                onClick={handleLocate}
                disabled={locating || !mapReady}
                className={cn(
                  "absolute inset-e-3 top-3 z-30 gap-1.5 shadow-lg",
                  locating && "animate-st-pulse",
                )}
              >
                {locating ? (
                  <span className="border-gold-soft size-3.5 animate-spin rounded-full border-2 border-t-transparent" />
                ) : (
                  <LocateFixed className="size-3.5" />
                )}
                موقعیت من (GPS)
              </Button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <label
                  htmlFor="map-found-address"
                  className="text-navy dark:text-ivory text-xs font-black"
                >
                  آدرس یافت‌شده
                </label>
                {typing ? (
                  <span className="text-gold inline-flex items-center gap-1 text-[10px] font-bold">
                    <span
                      aria-hidden
                      className="bg-gold animate-twinkle size-1.5 rounded-full"
                    />
                    در حال نوشتن…
                  </span>
                ) : preview.trim() ? (
                  <CheckCircle2
                    key={doneTick}
                    aria-hidden
                    className="text-emerald-600 animate-marker-drop size-3.5 dark:text-emerald-400"
                  />
                ) : null}
              </div>
              <div
                className={cn(
                  "relative overflow-hidden rounded-2xl transition-shadow duration-500",
                  typing && "ring-gold/40 ring-2",
                )}
              >
                <textarea
                  id="map-found-address"
                  value={preview}
                  onFocus={finishTypingNow}
                  onChange={(e) => {
                    finishTypingNow();
                    setPreview(e.target.value);
                  }}
                  readOnly={typing}
                  rows={3}
                  maxLength={160}
                  placeholder="پس از انتخاب نقطه روی نقشه، آدرس اینجا نوشته می‌شود…"
                  className="bg-sand/60 text-navy placeholder:text-navy/70 dark:bg-navy-deep/40 dark:text-ivory dark:placeholder:text-ivory/30 min-h-20 w-full rounded-2xl px-4 py-3 text-sm font-semibold outline-none"
                />
                {geocoding ? (
                  <span className="animate-shimmer via-gold/25 bg-linear-to-r pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 from-transparent to-transparent" />
                ) : null}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                انصراف
              </Button>
              <Button type="button" variant="navy" onClick={handleConfirm}>
                تأیید و استفاده از این آدرس
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
