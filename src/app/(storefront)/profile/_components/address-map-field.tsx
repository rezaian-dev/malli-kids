"use client";

// 🗺️ Leaflet's own stylesheet — scoped to this file (the map's only
// consumer) instead of the storefront's global CSS entry, so it isn't
// shipped as render-blocking CSS on every unrelated page. This component
// only ever mounts inside the profile's already-lazy (`ssr:false`) info
// panel, so the import rides along on that same on-demand chunk.
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { Map as LeafletMap } from "leaflet";
import { CheckCircle2, ChevronUp, LocateFixed, MapPin } from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";
import { reverseGeocodeAction } from "../_lib/actions";
import type { UpdateAccountValues } from "../_lib/schemas";
import { loadLeaflet } from "./leaflet-loader";

const PICK_DEBOUNCE_MS = 600;
// 🎬 How long the settle bounce (`--animate-marker-drop` in theme.css)
// plays before the indicator resumes its idle float — kept a hair after
// that animation's own 500ms so the two never overlap mid-bounce.
const SETTLE_BOUNCE_MS = 520;
// ✍️ The reverse-geocoded address reveals one *word* at a time via a
// staggered `animation-delay` per chunk (see the "آدرس یافت‌شده" field
// below) — word-level, not character-level: Persian is a cursive script
// where a letter's glyph shape depends on its neighbors, and giving each
// character its own box (required for the per-chunk transform) breaks that
// joining, rendering every letter in its isolated form until the reveal
// finishes — exactly the "garbled, then fixes itself" look this replaces.
// A whole word is one unbroken text node, so shaping inside it is
// untouched; only the (shaping-irrelevant) gaps between words animate in
// separately. `REVEAL_ANIM_MS` must track `--animate-letter-in`'s own
// duration in `theme.css` so the "typing" state clears exactly when the
// last chunk's animation actually finishes, not before or after.
const WORD_STAGGER_MS = 45;
const REVEAL_ANIM_MS = 340;

/** 📍 "انتخاب روی نقشه" — an inline (never a dialog/overlay) map card that
 *  expands right below the address field.
 *
 *  🎯 The location indicator is a **fixed overlay pinned to the exact
 *  center of the map's viewport** — plain React/CSS, not a Leaflet marker.
 *  It never moves on screen; instead the user drags/pans the *map itself*
 *  underneath it, exactly like Google Maps' or Airbnb's "drop a pin"
 *  picker. Whatever geographic point ends up under that fixed tip when
 *  panning stops becomes the candidate location — read straight off
 *  `map.getCenter()`, never off a marker's own coordinates. Clicking
 *  anywhere on the map, confirming a GPS fix, or panning with the
 *  keyboard all funnel through the same `moveend` handler, so there is
 *  exactly one place that turns "the map settled somewhere" into a
 *  candidate + a debounced reverse-geocode. A real *draggable* marker was
 *  deliberately not used here: this app's map previously tried gluing a
 *  pin to the visual center by re-reading it on every `move` tick, which
 *  fought the browser's own compositor-driven pan and read as laggy; a
 *  plain centered overlay that only *reacts* to `movestart`/`moveend`
 *  (not synced to every intermediate frame) is both simpler and smoother.
 *
 *  Reads and writes `lat`/`lng`/`address` straight off the surrounding
 *  `<AppForm>`'s react-hook-form context — those three only ever get
 *  committed together when the user presses "تأیید", and only really
 *  saved once "ذخیره حساب" is submitted like every other account field. */
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
  // 📍 The *candidate* location — whatever the map's center settled on
  // last. Conceptually distinct from the form's saved `lat`/`lng`: this
  // only becomes real once "تأیید" below copies it into the form, and only
  // persists once the account form itself is submitted.
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  // 🪁 True from the moment the map starts moving (drag/GPS-flight/
  // keyboard pan) until it settles — drives the fixed indicator's
  // lifted-and-wobbling state so it reads as "riding along above the map"
  // rather than glued to it.
  const [moving, setMoving] = useState(false);
  // 🎬 Bumped on every settle so the indicator's drop-bounce replays each
  // time (via `key`), not just the first.
  const [settleTick, setSettleTick] = useState(0);
  const [bouncing, setBouncing] = useState(false);

  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 🧊 Plain functions, not `useCallback` — none of these are ever compared
  // by reference (not a `useEffect`/`useMemo` dependency, not passed to a
  // memoized child; the map-building effect below intentionally closes over
  // whatever version of them exists when it runs, via its own `[open]`-only
  // dependency array), so memoizing them buys nothing.
  function stopTyping() {
    if (typeTimeoutRef.current) clearTimeout(typeTimeoutRef.current);
    typeTimeoutRef.current = null;
    setTyping(false);
  }

  // ✍️ Unlike the old JS-driven char-by-char slice, `preview` is set to the
  // *full* text immediately — the letter-by-letter reveal is now purely a
  // CSS stagger on already-present `<span>`s (see the JSX below), so this
  // just needs one `setTimeout` sized to when the last letter's own
  // animation finishes, not a repeating tick per character.
  function startTypewriter(text: string) {
    stopTyping();
    setPreview(text);
    setTyping(true);
    // 🧮 Same split the JSX below uses to build the animated chunks — the
    // count (not the string content) is all that matters here.
    const chunks = text.split(/(\s+)/).length;
    const total = Math.max(chunks - 1, 0) * WORD_STAGGER_MS + REVEAL_ANIM_MS;
    typeTimeoutRef.current = setTimeout(() => {
      typeTimeoutRef.current = null;
      setTyping(false);
      setDoneTick((n) => n + 1);
    }, total);
  }

  // ⏩ Editing the preview mid-animation (or just wanting the full text
  // instantly) should feel responsive, not fight the reveal — `preview`
  // already holds the full text, so this just cuts the reveal short.
  function finishTypingNow() {
    if (!typeTimeoutRef.current) return;
    stopTyping();
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

  // 📌 The map settled somewhere (drag released, a GPS flight finished, a
  // keyboard pan stopped, a tap-to-recenter pan completed) — read the
  // *current center*, never a marker's own coordinates, since the
  // indicator never moves independently of the map. Debounced so a quick
  // flurry of small settles (e.g. someone flicking the map around) only
  // ever fires one reverse-geocode request, not one per settle.
  function handleSettle(map: LeafletMap) {
    setMoving(false);
    setSettleTick((n) => n + 1);
    setBouncing(true);
    if (bounceTimeoutRef.current) clearTimeout(bounceTimeoutRef.current);
    bounceTimeoutRef.current = setTimeout(() => {
      bounceTimeoutRef.current = null;
      setBouncing(false);
    }, SETTLE_BOUNCE_MS);

    const center = map.getCenter();
    setPicked({ lat: center.lat, lng: center.lng });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => runGeocode(center.lat, center.lng),
      PICK_DEBOUNCE_MS,
    );
  }

  function handleLocate() {
    if (!navigator.geolocation) {
      toast.error("مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند.");
      return;
    }
    const map = mapRef.current;
    if (!map) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        // 🎯 `moveend` (fired once the flight finishes) is what actually
        // turns this into a candidate + reverse-geocode — same single path
        // every other kind of settle goes through.
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
    // 📍 A previously-saved location *is* already a selection. Otherwise
    // nothing's been picked yet — `picked` stays null until the map's
    // first `moveend` (fired the moment Leaflet finishes its own initial
    // layout) sets it from wherever the map actually opened on.
    setPicked(hasExisting ? { lat: existingLat, lng: existingLng } : null);
    setPreview(getValues("address") ?? "");

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

        // 🎯 One pair of handlers drives every interaction — drag, GPS
        // flight, keyboard pan (Leaflet's own default arrow-key handling),
        // and the tap-to-recenter pan below all just move the map, and the
        // map itself doesn't care which caused it.
        map.on("movestart", () => setMoving(true));
        map.on("moveend", () => handleSettle(map));

        // 🖱️ A tap doesn't drop anything *at* that point — it pans so that
        // point ends up under the fixed center indicator, then `moveend`
        // above picks it up like any other settle. Keeps a single mental
        // model ("the map moves, the pin doesn't") instead of two
        // different selection gestures.
        map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
          map.panTo(e.latlng, { animate: true });
        });

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
      if (bounceTimeoutRef.current) clearTimeout(bounceTimeoutRef.current);
      stopTyping();
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 🎯 only re-run on open/close.
  }, [open]);

  function handleConfirm() {
    // ♿️ `picked` (the map's last-settled center) is the fast path, but
    // lat/lng are optional on the account schema — a keyboard user who'd
    // rather not touch the map at all can still tab into this card's
    // textarea below, edit the address text, and confirm without ever
    // moving the map.
    if (!picked && !preview.trim()) {
      toast.warning("اول نقشه را جابه‌جا کنید یا آدرس را تایپ کنید.");
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
              نقشه را جابه‌جا کنید تا نشانگرِ وسط، روی نقطهٔ موردنظر بیفتد —
              خودِ نشانگر ثابت می‌ماند و نقشه زیرِ آن حرکت می‌کند. با تایپ
              روی نقطه‌ای هم می‌توانید نقشه را به همان‌جا برسانید. آدرس متنی
              خودکار پر می‌شود.
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
                  aria-label="نقشه‌ی انتخاب موقعیت — نقشه را با ماوس یا لمس جابه‌جا کنید تا نشانگرِ ثابتِ وسطِ نقشه روی نقطهٔ موردنظر بیفتد؛ روی نقطه‌ای هم بزنید تا نقشه به همان‌جا برسد. با کلیدهای جهت‌دار هم می‌توانید نقشه را جابه‌جا کنید. برای واردکردن آدرس با صفحه‌کلید می‌توانید از فیلد «آدرس یافت‌شده» زیر نقشه هم استفاده کنید"
                  className={cn(
                    "absolute inset-0 outline-none",
                    // 👁️ Visible, on-brand focus ring on the Leaflet
                    // container itself (it — not this wrapper — is what
                    // actually receives keyboard focus, since Leaflet sets
                    // its own `tabindex="0"` for arrow-key panning).
                    "focus-visible:ring-gold/50 focus-visible:ring-4 focus-visible:ring-inset",
                  )}
                />
              </div>

              {/* 🎯 The fixed center indicator — plain React/CSS pinned to
                  the exact geometric center of this box, never a Leaflet
                  marker. `pointer-events-none` so it never intercepts the
                  drag/click/tap that's meant for the map underneath it. */}
              {mapReady ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-400 flex items-center justify-center"
                >
                  <div
                    key={settleTick}
                    className={cn(
                      "relative -translate-y-[calc(50%+2px)]",
                      moving
                        ? "animate-pin-lift"
                        : bouncing
                          ? "animate-marker-drop"
                          : "animate-pin-float",
                    )}
                    style={{ width: 34, height: 34 }}
                  >
                    <span
                      className={cn(
                        "bg-navy-deep/45 absolute rounded-full blur-[1.5px] transition-[transform,opacity] duration-200 ease-out",
                        moving && "scale-50 opacity-30",
                      )}
                      style={{
                        left: "50%",
                        bottom: 1,
                        width: 14,
                        height: 5,
                        transform: "translateX(-50%)",
                      }}
                    />
                    <span
                      className="absolute inset-0"
                      style={{ transformOrigin: "50% 100%" }}
                    >
                      <svg
                        width="34"
                        height="34"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="drop-shadow-[0_6px_8px_rgba(4,20,39,0.45)]"
                      >
                        <defs>
                          <linearGradient
                            id="malliPinBody"
                            x1="4"
                            y1="1"
                            x2="20"
                            y2="22"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop offset="0%" stopColor="#f0c878" />
                            <stop offset="55%" stopColor="#c19357" />
                            <stop offset="100%" stopColor="#b8893f" />
                          </linearGradient>
                          <radialGradient
                            id="malliPinShine"
                            cx="35%"
                            cy="22%"
                            r="45%"
                          >
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                          </radialGradient>
                        </defs>
                        <path
                          d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 6.5 8.5 15.5 8.5 15.5s8.5-9 8.5-15.5C20.5 3.81 16.69 0 12 0z"
                          fill="url(#malliPinBody)"
                          stroke="#0e2a47"
                          strokeWidth="1"
                        />
                        <path
                          d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 6.5 8.5 15.5 8.5 15.5s8.5-9 8.5-15.5C20.5 3.81 16.69 0 12 0z"
                          fill="url(#malliPinShine)"
                        />
                        <circle
                          cx="12"
                          cy="8.5"
                          r="4"
                          fill="#fff8ec"
                          stroke="#0e2a47"
                          strokeWidth="0.9"
                        />
                        <circle cx="12" cy="8.5" r="1.8" fill="#0e2a47" />
                      </svg>
                    </span>
                  </div>
                </div>
              ) : null}

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
                  "absolute inset-e-3 top-3 z-401 gap-1.5 shadow-lg",
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
              {/* 🔊 `aria-live` so a screen-reader user hears the address
                  update as soon as a reverse-geocode lands, without needing
                  focus already inside this field — the textarea's `value`
                  changes exactly once per geocode (the letter-by-letter
                  reveal below is a purely decorative CSS overlay, not a
                  per-letter DOM/value change), so this never floods. */}
              <div
                aria-live="polite"
                className={cn(
                  "relative overflow-hidden rounded-2xl transition-shadow duration-500",
                  typing &&
                    "ring-gold/50 shadow-[0_0_28px_-6px_rgba(193,147,87,0.65)] ring-2",
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
                  placeholder="پس از جابه‌جا کردن نقشه، آدرس اینجا نوشته می‌شود…"
                  className={cn(
                    "bg-sand/60 text-navy placeholder:text-navy/70 dark:bg-navy-deep/40 dark:text-ivory dark:placeholder:text-ivory/30 min-h-20 w-full rounded-2xl px-4 py-3 text-sm font-semibold outline-none",
                    // 🎭 The animated overlay below stands in for the real
                    // textarea while it reveals — `invisible` (not
                    // `opacity-0`/`hidden`) keeps this box's own size and
                    // background driving the layout underneath it, exactly
                    // where the overlay sits.
                    typing && "invisible",
                  )}
                />
                {typing ? (
                  // ✍️ Each *word* (not letter) is its own `<span>` with a
                  // staggered `animation-delay` (`--animate-letter-in`, see
                  // theme.css) — fades/rises up from a gold glow into the
                  // real text color, like it's being inked in. Word-level
                  // specifically: giving each individual Persian letter its
                  // own box (needed for the transform) breaks the script's
                  // cursive joining, rendering isolated letterforms until
                  // the reveal finishes — splitting on `(\s+)` keeps every
                  // whitespace run too (as its own tiny chunk), so nothing
                  // in the original text is lost, only regrouped. Purely
                  // CSS-driven (no per-tick React state), so it runs
                  // smoothly on the compositor regardless of length.
                  <div
                    aria-hidden
                    dir="rtl"
                    className="bg-sand/60 text-navy dark:bg-navy-deep/40 dark:text-ivory pointer-events-none absolute inset-0 min-h-20 w-full overflow-hidden rounded-2xl px-4 py-3 text-sm font-semibold whitespace-pre-wrap"
                  >
                    {preview.split(/(\s+)/).map((chunk, i) => (
                      <span
                        key={i}
                        className="animate-letter-in motion-reduce:animate-none inline-block"
                        style={{ animationDelay: `${i * WORD_STAGGER_MS}ms` }}
                      >
                        {chunk}
                      </span>
                    ))}
                  </div>
                ) : null}
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
