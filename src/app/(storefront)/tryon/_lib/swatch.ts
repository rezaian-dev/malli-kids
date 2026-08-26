import { cn } from "@/lib/utils";

/** Shared swatch-button style for the try-on pickers. */
export function swatchClass(active: boolean) {
  return cn(
    "overflow-hidden rounded-xl border-2 transition-all duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-95",
    active
      ? "border-gold motion-safe:hover:shadow-md motion-safe:hover:shadow-gold/30"
      : "hover:border-gold/40 border-transparent",
  );
}
