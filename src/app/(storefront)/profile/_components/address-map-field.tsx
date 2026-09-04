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
import { CheckCircle2, ChevronUp, LocateFixed, MapPin } from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";
import { reverseGeocodeAction } from "../_lib/actions";
import type { UpdateAccountValues } from "../_lib/schemas";
import { loadLeaflet } from "./leaflet-loader";

const PICK_DEBOUNCE_MS = 600;
// ✍️ The reverse-geocoded address reveals one letter at a time via a
// staggered `animation-delay` per character (see the "آدرس یافت‌شده" field
// below) — `LETTER_ANIM_MS` must track `--animate-letter-in`'s own duration
// in `theme.css` so the "typing" state clears exactly when the last
// letter's animation actually finishes, not before or after.
const LETTER_STAGGER_MS = 9;
const LETTER_ANIM_MS = 340;
// 🪁 How long the initial drop-in bounce (`--animate-marker-drop`, also in
// theme.css) takes before an unselected placeholder marker starts idly
// floating — kept a hair after that animation's own 500ms so the two never
// overlap mid-bounce.
const FLOAT_START_DELAY_MS = 520;

/** 📍 "انتخاب روی نقشه" — an inline (never a dialog/overlay) map card that
 *  expands right below the address field. No marker shows until the user
 *  actually picks a spot — clicking anywhere on the map (or confirming a
 *  GPS fix) drops a real, draggable Leaflet marker exactly there and
 *  reverse-geocodes it into the account form's `address` field (typed in
 *  with a small animation); dragging that marker afterwards fine-tunes the
 *  point without re-clicking, floating/wobbling while held and settling
 *  with a little bounce on release. A previous version instead kept a pin
 *  permanently glued to the map's visual center, picking up whatever was
 *  under it on every pan — dropped in favor of this explicit
 *  click-then-drag model. Reads and writes `lat`/`lng`/`address` straight
 *  off the surrounding `<AppForm>`'s react-hook-form context — those three
 *  only ever get committed together when the user presses "تأیید", and
 *  only really saved once "ذخیره حساب" is submitted like every other
 *  account field. */
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
  const typeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 🪁 Bridges `placeMarker`'s "start floating after the drop-in bounce"
  // timeout (set inside the map-building effect's `.then`) to the effect's
  // own cleanup (a sibling scope) and to `confirmSelection` (needs to
  // cancel it early if a real pick lands before it ever fires).
  const floatTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 🧊 Plain functions, not `useCallback` — none of these are ever compared
  // by reference (not a `useEffect`/`useMemo` dependency, not passed to a
  // memoized child; the map-building effect below intentionally closes over
  // whatever version of `handlePick` exists when it runs, via its own
  // `[open]`-only dependency array), so memoizing them buys nothing.
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
    const total = Math.max(text.length - 1, 0) * LETTER_STAGGER_MS + LETTER_ANIM_MS;
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

        // 🩹 Both helpers reach into the marker's *actual* DOM node
        // (`getElement()`) and toggle plain classes on it — cheaper and
        // simpler than routing marker visuals through React state, since
        // this element lives entirely outside React's tree (Leaflet owns
        // it). `[data-pin-body]`/`[data-pin-shadow]` are the two children
        // inside the icon markup built below.
        function getPinParts(marker: LeafletMarker) {
          const el = marker.getElement();
          return {
            body: el?.querySelector<HTMLElement>("[data-pin-body]") ?? null,
            shadow:
              el?.querySelector<HTMLElement>("[data-pin-shadow]") ?? null,
          };
        }
        // 🎬 Removing+re-adding the same class doesn't replay a CSS
        // animation — the browser sees no change. Forcing a reflow
        // (`offsetWidth`) in between makes the removal "count" first.
        function replayDrop(marker: LeafletMarker) {
          const { body } = getPinParts(marker);
          if (!body) return;
          body.classList.remove("animate-marker-drop");
          void body.offsetWidth;
          body.classList.add("animate-marker-drop");
        }
        // 🪁 The lifted state is what sells "held in the air, not glued to
        // the map": the pin floats/wobbles (`animate-pin-lift`, an
        // infinite loop — see `theme.css`) while its ground shadow shrinks
        // and fades, exactly the inverse of a real object moving away from
        // its shadow's light source.
        function setLifted(marker: LeafletMarker, lifted: boolean) {
          const { body, shadow } = getPinParts(marker);
          if (lifted) body?.classList.remove("animate-marker-drop", "animate-floaty");
          body?.classList.toggle("animate-pin-lift", lifted);
          shadow?.classList.toggle("scale-50", lifted);
          shadow?.classList.toggle("opacity-30", lifted);
        }
        // 🎈 The *idle* float — reused from the app's own `animate-floaty`
        // token, not a bespoke one — for a marker that's just a starting
        // placeholder, nobody has picked it yet. `animate-marker-drop` and
        // `animate-floaty` both set the same `animation` CSS property, so
        // only one may ever be present at once or the later one in the
        // stylesheet silently wins outright (not "both play") — hence the
        // explicit removal here rather than trusting `classList.toggle`.
        function setFloating(marker: LeafletMarker, floating: boolean) {
          const { body } = getPinParts(marker);
          if (!body) return;
          if (floating) body.classList.remove("animate-marker-drop");
          body.classList.toggle("animate-floaty", floating);
        }
        // ✅ The single place a placeholder marker turns into a real pick:
        // cancels any still-pending "start floating" timeout (in case this
        // fires before that ever gets the chance to), stops floating for
        // good, and plays the settle bounce.
        function confirmSelection(marker: LeafletMarker) {
          if (floatTimeoutRef.current) {
            clearTimeout(floatTimeoutRef.current);
            floatTimeoutRef.current = null;
          }
          setFloating(marker, false);
          replayDrop(marker);
        }

        // 📍 A real, draggable Leaflet marker — shown immediately when the
        // card opens (never withheld until a click), so there's always
        // something on the map to orient by. `draggable: true` lets the
        // user fine-tune the exact spot after a rough click/GPS placement.
        function placeMarker(
          nextLat: number,
          nextLng: number,
          opts?: { floating?: boolean },
        ) {
          if (markerRef.current) {
            markerRef.current.setLatLng([nextLat, nextLng]);
            confirmSelection(markerRef.current); // an explicit re-placement is always a real pick
            return;
          }
          const marker = L.marker([nextLat, nextLng], {
            // 🎨 A hand-drawn teardrop pin (gradient body, glossy
            // highlight, navy-ringed "eye") instead of a stock icon —
            // `data-pin-shadow`/`data-pin-body` are separate siblings, not
            // nested, so the shadow can shrink/fade independently of the
            // body lifting/wobbling above it.
            icon: L.divIcon({
              html: renderToStaticMarkup(
                <span className="relative block" style={{ width: 34, height: 34 }}>
                  <span
                    data-pin-shadow
                    className="bg-navy-deep/45 absolute rounded-full blur-[1.5px] transition-[transform,opacity] duration-200 ease-out"
                    style={{
                      left: "50%",
                      bottom: 1,
                      width: 14,
                      height: 5,
                      transform: "translateX(-50%)",
                    }}
                  />
                  <span
                    data-pin-body
                    className="animate-marker-drop absolute inset-0"
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
                </span>,
              ),
              className: "", // 🧹 drops Leaflet's default white-box marker styling
              iconSize: [34, 34],
              iconAnchor: [17, 33],
            }),
            draggable: true,
            keyboard: false, // the map container itself carries keyboard selection, below
          }).addTo(map);

          marker.on("dragstart", () => {
            // 🖐️ Dragging *is* a real pick in progress — even straight off
            // the still-floating placeholder — so it cancels the float
            // timeout and clears the class itself the same way
            // `confirmSelection` does, just without the settle bounce
            // (that plays on release instead, via `dragend` below).
            if (floatTimeoutRef.current) {
              clearTimeout(floatTimeoutRef.current);
              floatTimeoutRef.current = null;
            }
            setFloating(marker, false);
            setLifted(marker, true);
          });
          marker.on("dragend", () => {
            setLifted(marker, false);
            confirmSelection(marker); // small landing bounce, echoing a click/GPS placement
            const ll = marker.getLatLng();
            handlePick(ll.lat, ll.lng);
          });

          markerRef.current = marker;
          if (opts?.floating) {
            floatTimeoutRef.current = setTimeout(() => {
              floatTimeoutRef.current = null;
              setFloating(marker, true);
            }, FLOAT_START_DELAY_MS);
          }
        }
        placeMarkerRef.current = placeMarker;
        // 📍 Always shown from the moment the map appears — a saved
        // location is already a real pick (no float, `picked` set above);
        // a brand-new user instead gets a floating placeholder sitting at
        // the default center, settling into a real pick only once they
        // actually click, drag, GPS, or Enter-select somewhere.
        placeMarker(startLat, startLng, { floating: !hasExisting });

        // 🖱️ Click drops (or moves) the marker exactly where clicked and
        // picks that point immediately — dragging (above) is for fine-tuning
        // afterwards, not required for a first placement.
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
      if (floatTimeoutRef.current) clearTimeout(floatTimeoutRef.current);
      floatTimeoutRef.current = null;
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
              بگیرد؛ برای تنظیم دقیق‌تر می‌توانید نشانگر را هم بکشید. آدرس
              متنی خودکار پر می‌شود.
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
                  aria-label="نقشه‌ی انتخاب موقعیت — روی نقطهٔ موردنظر کلیک کنید تا نشانگر همان‌جا قرار بگیرد و برای تنظیم دقیق‌تر آن را بکشید؛ یا با کلیدهای جهت‌دار نقشه را جابه‌جا و با اینتر همان نقطهٔ مرکز را انتخاب کنید. برای واردکردن آدرس با صفحه‌کلید می‌توانید از فیلد «آدرس یافت‌شده» زیر نقشه هم استفاده کنید"
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
                  placeholder="پس از انتخاب نقطه روی نقشه، آدرس اینجا نوشته می‌شود…"
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
                  // ✍️ Each letter is its own `<span>` with a staggered
                  // `animation-delay` (`--animate-letter-in`, see
                  // theme.css) — fades/rises up from a gold glow into the
                  // real text color, like it's being inked in one letter at
                  // a time. Purely CSS-driven (no per-tick React state), so
                  // it runs smoothly on the compositor regardless of how
                  // long `preview` is.
                  <div
                    aria-hidden
                    dir="rtl"
                    className="bg-sand/60 text-navy dark:bg-navy-deep/40 dark:text-ivory pointer-events-none absolute inset-0 min-h-20 w-full overflow-hidden rounded-2xl px-4 py-3 text-sm font-semibold whitespace-pre-wrap"
                  >
                    {[...preview].map((ch, i) => (
                      <span
                        key={i}
                        className="animate-letter-in motion-reduce:animate-none inline-block"
                        style={{ animationDelay: `${i * LETTER_STAGGER_MS}ms` }}
                      >
                        {ch === " " ? " " : ch}
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
