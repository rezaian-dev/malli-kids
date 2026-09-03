"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { CheckCircle2, Loader2, LocateFixed, MapPin } from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BRAND } from "@/lib/constants";
import { reverseGeocodeAction } from "../_lib/actions";
import type { UpdateAccountValues } from "../_lib/schemas";
import { loadLeaflet } from "./leaflet-loader";

const PICK_DEBOUNCE_MS = 600;
const TYPE_CHARS_PER_TICK = 2;
const TYPE_TICK_MS = 22;

function bounceMarker(marker: LeafletMarker) {
  const el = marker.getElement();
  if (!el) return;
  // 🔁 Restart the CSS animation even if the class never left — a plain
  // re-`add` on an already-present class is a no-op in the browser.
  el.classList.remove("animate-marker-drop");
  void el.offsetWidth;
  el.classList.add("animate-marker-drop");
}

/** 📍 "انتخاب روی نقشه" — opens a Leaflet/Neshan map, lets the user click,
 *  drag the marker, or use GPS, then reverse-geocodes the point into the
 *  account form's `address` field (typed in with a small animation). Reads
 *  and writes `lat`/`lng`/`address` straight off the surrounding
 *  `<AppForm>`'s react-hook-form context — those three only ever get
 *  committed together when the user presses "تأیید", and only really saved
 *  once "ذخیره حساب" is submitted like every other account field. */
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

  const stopTyping = useCallback(() => {
    if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    typeIntervalRef.current = null;
    setTyping(false);
  }, []);

  const startTypewriter = useCallback(
    (text: string) => {
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
    },
    [stopTyping],
  );

  // ⏩ Editing the preview mid-animation (or just wanting the full text
  // instantly) should feel responsive, not fight the typewriter.
  const finishTypingNow = useCallback(() => {
    if (!typeIntervalRef.current) return;
    stopTyping();
    setPreview(typeTargetRef.current);
    setDoneTick((n) => n + 1);
  }, [stopTyping]);

  const runGeocode = useCallback(
    async (nextLat: number, nextLng: number) => {
      setGeocoding(true);
      const result = await reverseGeocodeAction({ lat: nextLat, lng: nextLng });
      setGeocoding(false);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      startTypewriter(result.data.address);
    },
    [startTypewriter],
  );

  const handlePick = useCallback(
    (nextLat: number, nextLng: number, recenter = false) => {
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
    },
    [runGeocode],
  );

  const handleLocate = useCallback(() => {
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
  }, [handlePick]);

  // 🗺️ Build a fresh map every time the dialog opens, tear it down when it
  // closes — simpler and safer than trying to keep one Leaflet instance
  // alive across a Radix portal unmounting its content.
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
        // 🩹 Leaflet measures its container on init; inside a just-opened
        // Dialog that can race the open transition, leaving grey tiles.
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
    if (!picked) {
      toast.warning("اول یک نقطه روی نقشه انتخاب کنید.");
      return;
    }
    setValue("lat", picked.lat, { shouldDirty: true });
    setValue("lng", picked.lng, { shouldDirty: true });
    if (preview.trim()) {
      setValue("address", preview.trim(), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    toast.success(
      "موقعیت روی نقشه ثبت شد — برای ذخیرهٔ نهایی «ذخیره حساب» را بزنید.",
    );
    setOpen(false);
  }

  const hasPin = Boolean(lat && lng);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-1.5">
            <MapPin className="size-3.5" />
            {hasPin ? "ویرایش موقعیت روی نقشه" : "انتخاب روی نقشه"}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>موقعیت روی نقشه</DialogTitle>
            <DialogDescription>
              روی نقشه بزنید یا نشانگر را جابه‌جا کنید؛ آدرس متنی خودکار پر
              می‌شود.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-sand relative h-72 w-full overflow-hidden rounded-2xl sm:h-80">
            <div ref={mapElRef} className="absolute inset-0" />

            {!mapReady && !mapError ? (
              <div className="text-navy/60 dark:text-ivory/60 absolute inset-0 flex items-center justify-center gap-2">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-xs font-bold">در حال بارگذاری نقشه…</span>
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
              <label className="text-navy dark:text-ivory text-xs font-black">
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
                className="bg-sand/60 text-navy placeholder:text-navy/50 dark:bg-navy-deep/40 dark:text-ivory dark:placeholder:text-ivory/30 min-h-20 w-full rounded-2xl px-4 py-3 text-sm font-semibold outline-none"
              />
              {geocoding ? (
                <span className="animate-shimmer via-gold/25 bg-linear-to-r pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 from-transparent to-transparent" />
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              انصراف
            </Button>
            <Button type="button" variant="navy" onClick={handleConfirm}>
              تأیید و استفاده از این آدرس
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {hasPin ? (
        <span className="animate-fade-up bg-gold/10 text-navy dark:text-gold-light inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold">
          <MapPin className="size-3" /> موقعیت روی نقشه ثبت شده
        </span>
      ) : null}
    </div>
  );
}
