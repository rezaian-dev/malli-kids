import Image from "next/image";
import { Shirt } from "lucide-react";
import { CORE_PRODUCTS } from "@/lib/data/products";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { swatchClass } from "../_lib/swatch";

/** Garment picker, height input and suggested size. */
export function TryOnControls({
  garment,
  onGarmentChange,
  height,
  onHeightChange,
  size,
}: {
  garment: number;
  onGarmentChange: (index: number) => void;
  height: string;
  onHeightChange: (height: string) => void;
  size: string;
}) {
  return (
    <div>
      <h2
        className={cn(
          "mb-3 flex items-center gap-2 text-lg font-black",
          "text-navy",
          "dark:text-ivory",
        )}
      >
        <Shirt className="text-gold size-5" /> لباس کالکشن
      </h2>
      <div className="grid grid-cols-4 gap-2">
        {CORE_PRODUCTS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onGarmentChange(i)}
            aria-pressed={garment === i}
            className={swatchClass(garment === i)}
          >
            <Image
              src={p.img}
              alt={p.name}
              width={60}
              height={80}
              className="aspect-3/4 w-full object-cover"
            />
          </button>
        ))}
      </div>

      <div
        className={cn(
          "mt-6 space-y-3 rounded-3xl p-5",
          "border-navy/10 border bg-white",
          "dark:border-gold/30 dark:bg-dusk",
        )}
      >
        <h2 className="text-navy dark:text-ivory font-black">
          اندازه برای پیشنهاد سایز
        </h2>
        <div>
          <Label htmlFor="h">قد (سانتی‌متر)</Label>
          <Input
            id="h"
            inputMode="numeric"
            value={height}
            onChange={(e) => onHeightChange(e.target.value)}
            className="mt-1 rounded-2xl"
          />
        </div>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm font-black",
            "bg-gold/10 text-gold-deep",
            "dark:text-gold-soft",
          )}
        >
          سایز پیشنهادی: {size}
        </div>
      </div>
    </div>
  );
}
