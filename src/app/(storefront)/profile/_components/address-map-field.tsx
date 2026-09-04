"use client";

import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { CheckCircle2, ChevronUp, Loader2, LocateFixed, MapPin } from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";
import { reverseGeocodeAction } from "../_lib/actions";
import type { UpdateAccountValues } from "../_lib/schemas";
import { createPinIcon, loadLeaflet } from "./leaflet-loader";

const PICK_DEBOUNCE_MS = 600;
const TYPE_CHARS_PER_TICK = 2;
const TYPE_TICK_MS = 22;

function bounceMarker(marker: LeafletMarker) {
  // 🩹 Animate the inner `.marker-bounce` wrapper (see `createPinIcon`), not
  // the icon root itself — the root's `transform` is how Leaflet positions
  // the marker on the map, and this animation also drives `transform`;
  // putting both on one element made the marker jump off to the map's
  // transform origin (looking like it vanished) the first time it bounced.
  const el = marker.getElement()?.querySelector<HTMLElement>(".marker-bounce");
  if (!el) return;
  // 🔁 Restart the CSS animation even if the class never left — a plain
  // re-`add` on an already-present class is a no-op in the browser.
  el.classList.remove("animate-marker-drop");
  void el.offsetWidth;
  el.classList.add("animate-marker-drop");
}

/** 📍 "انتخاب روی نقشه" — an inline (never a dialog/overlay) map card that
 *  expands right below the address field. The user clicks, drags the pin,
 *  or uses GPS, and the point gets reverse-geocoded into the account form's
 *  `address` field (typed in with a small animation). Reads and writes
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

  function handlePick(nextLat: number, nextLng: number, recenter = false) {
    setPicked({ lat: nextLat, lng: nextLng });
    if (markerRef.current) {
      markerRef.current.setLatLng([nextLat, nextLng]);
      bounceMarker(markerRef.current);
    }
    if (recenter && mapRef.current) {
      mapRef.current.flyTo(
        [nextLat, nextLng],
        Math.max(mapRef.current.getZoom(), 16),
        { duration: 0.9 },
      );
    }
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
        handlePick(pos.coords.latitude, pos.coords.longitude, true);
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
    const startLat = existingLat ?? BRAND.map.lat;
    const startLng = existingLng ?? BRAND.map.lng;
    setPicked(
      existingLat != null && existingLng != null
        ? { lat: existingLat, lng: existingLng }
        : null,
    );
    setPreview(getValues("address") ?? "");
    typeTargetRef.current = getValues("address") ?? "";

    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapElRef.current) return;
        const map = new L.Map(mapElRef.current, {
          center: [startLat, startLng],
          zoom: 15,
        });
        // 🆓 OpenStreetMap's own tile server — free, no key, no signup.
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
        }).addTo(map);
        const marker = L.marker([startLat, startLng], {
          draggable: true,
          icon: createPinIcon(L),
        }).addTo(map);
        marker.on("dragend", () => {
          const { lat: mLat, lng: mLng } = marker.getLatLng();
          handlePick(mLat, mLng);
        });
        map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
          handlePick(e.latlng.lat, e.latlng.lng);
        });

        mapRef.current = map;
        markerRef.current = marker;
        setMapReady(true);
        // 🩹 Leaflet measures its container on init; while the card is still
        // mid-expand that can race the CSS transition, leaving grey tiles.
        setTimeout(() => map.invalidateSize(), 80);
      })
      .catch((e: Error) => {
        if (!cancelled) setMapError(e.message);
      });

    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      stopTyping();
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 🎯 only re-run on open/close.
  }, [open]);

  function handleConfirm() {
    // ♿️ `picked` (a map click/drag/GPS fix) is the fast path, but lat/lng
    // are optional on the account schema — a keyboard user who can't click
    // the map itself can still tab into this card's textarea below, edit
    // the address text, and confirm without ever placing a pin.
    if (!picked && !preview.trim()) {
      toast.warning("اول یک نقطه روی نقشه انتخاب کنید یا آدرس را تایپ کنید.");
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
              روی نقشه بزنید یا نشانگر را جابه‌جا کنید؛ آدرس متنی خودکار پر
              می‌شود.
            </p>

            <div className="bg-sand relative h-72 w-full overflow-hidden rounded-2xl sm:h-80">
              <div
                ref={mapElRef}
                role="group"
                aria-label="نقشه‌ی انتخاب موقعیت — با ماوس یا لمس؛ برای واردکردن آدرس با صفحه‌کلید از فیلد «آدرس یافت‌شده» زیر نقشه استفاده کنید"
                className="absolute inset-0"
              />

              {!mapReady && !mapError ? (
                <div className="text-navy/70 dark:text-ivory/70 absolute inset-0 flex items-center justify-center gap-2">
                  <Loader2 className="size-5 animate-spin" />
                  <span className="text-xs font-bold">
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
                disabled={locating}
                className={cn(
                  "absolute inset-e-3 top-3 z-10 gap-1.5 shadow-lg",
                  locating && "animate-st-pulse",
                )}
              >
                {locating ? (
                  <Loader2 className="size-3.5 animate-spin" />
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
                  placeholder="پس از انتخاب نقطه، آدرس اینجا نوشته می‌شود…"
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
