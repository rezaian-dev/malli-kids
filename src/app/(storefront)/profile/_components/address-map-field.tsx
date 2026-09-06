"use client";

// 🗺️ Scoped here so Leaflet CSS ships only with this lazy chunk
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { Map as LeafletMap } from "leaflet";
import { CheckCircle2, ChevronUp, LocateFixed, MapPin } from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";
import { reverseGeocodeAction } from "../_lib/account-actions";
import type { UpdateAccountValues } from "../_lib/schemas";
import { loadLeaflet } from "./leaflet-loader";

const PICK_DEBOUNCE_MS = 600;
// 🎬 Sits just past the 500ms marker-drop so the two never overlap
const SETTLE_BOUNCE_MS = 520;
// ✍️ Reveal timing must track --animate-letter-in in theme.css
const WORD_STAGGER_MS = 45;
const REVEAL_ANIM_MS = 340;

// 📍 Inline map picker — fixed center overlay, not a Leaflet marker; every
// settle funnels through one `moveend` → candidate + reverse-geocode.
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
  // ✨ Rekeys the checkmark so its pop replays per address
  const [doneTick, setDoneTick] = useState(0);
  const [preview, setPreview] = useState("");
  // 📍 Candidate center — committed to the form only on confirm
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [moving, setMoving] = useState(false);
  // 🎬 Rekeys the indicator so the drop-bounce replays per settle
  const [settleTick, setSettleTick] = useState(0);
  const [bouncing, setBouncing] = useState(false);

  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 🧊 No useCallback — nothing compares these by reference
  function stopTyping() {
    if (typeTimeoutRef.current) clearTimeout(typeTimeoutRef.current);
    typeTimeoutRef.current = null;
    setTyping(false);
  }

  // ✍️ Full text up front — the reveal is a pure CSS stagger
  function startTypewriter(text: string) {
    stopTyping();
    setPreview(text);
    setTyping(true);
    // 🧮 Must mirror the JSX word split for the timing math
    const chunks = text.split(/(\s+)/).length;
    const total = Math.max(chunks - 1, 0) * WORD_STAGGER_MS + REVEAL_ANIM_MS;
    typeTimeoutRef.current = setTimeout(() => {
      typeTimeoutRef.current = null;
      setTyping(false);
      setDoneTick((n) => n + 1);
    }, total);
  }

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

  // 📌 Read the settled center, never marker coords; debounce the geocode
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
        // 🎯 moveend after the flight reuses the single settle path
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

  // 🗺️ Fresh map per open — safer than keeping Leaflet alive through unmount
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
    // 📍 A saved location already counts as picked
    setPicked(hasExisting ? { lat: existingLat, lng: existingLng } : null);
    setPreview(getValues("address") ?? "");

    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapElRef.current) return;
        const map = new L.Map(mapElRef.current, {
          center: [startLat, startLng],
          zoom: 15,
        });
        // 🆓 Keyless OSM tiles — unlike Esri (a US company that geo-blocks
        // sanctioned countries), OSM's tile server has no country block, so
        // this loads on an Iranian IP without a VPN.
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
        }).addTo(map);

        map.on("movestart", () => setMoving(true));
        map.on("moveend", () => handleSettle(map));

        // 🖱️ Taps pan the point under the fixed pin; moveend picks it up
        map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
          map.panTo(e.latlng, { animate: true });
        });

        mapRef.current = map;
        setMapReady(true);
        // 🩹 Card still mid-expand at init; ResizeObserver keeps Leaflet sized
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
    // ♿️ Address-only confirm works without ever touching the map
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

      {/* 📥 0fr↔1fr grid trick — animates open without a known height */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(.25,.1,.25,1)]",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className="space-y-3 rounded-2xl border p-3 sm:p-4 border-navy/10 bg-sand/40 dark:border-gold/20 dark:bg-navy-deep/30"
          >
            <p className="text-navy/70 dark:text-wheat text-xs leading-6">
              نقشه را جابه‌جا کنید تا نشانگرِ وسط، روی نقطهٔ موردنظر بیفتد —
              خودِ نشانگر ثابت می‌ماند و نقشه زیرِ آن حرکت می‌کند. با تایپ
              روی نقطه‌ای هم می‌توانید نقشه را به همان‌جا برسانید. آدرس متنی
              خودکار پر می‌شود.
            </p>

            <div className="bg-sand relative h-72 w-full overflow-hidden rounded-2xl sm:h-80">
              {/* 🩹 Fade the wrapper, not the mount node — React would clobber Leaflet's classes */}
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
                  className="absolute inset-0 outline-none focus-visible:ring-gold/50 focus-visible:ring-4 focus-visible:ring-inset"
                />
              </div>

              {/* 🎯 Fixed CSS pin; pointer-events pass through to the map */}
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
              {/* ♿️ Announce geocoded addresses; value changes once per geocode */}
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
                    // 🎭 invisible (not opacity-0) keeps this box driving layout
                    typing && "invisible",
                  )}
                />
                {typing ? (
                  // ✍️ Word-level spans — per-character boxes break Persian cursive joining
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
