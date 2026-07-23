import { cn } from "@/lib/utils";

/** ♿ Visually hidden until focused — lets keyboard/screen-reader users jump
 *  straight past the header/sidebar chrome to the page's real content. */
export function SkipLink({ targetId = "main-content" }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        "sr-only focus:not-sr-only",
        "focus-visible:ring-gold/60 focus:fixed focus:inset-s-3 focus:top-3 focus:z-100 focus:rounded-full focus:px-4 focus:py-2.5 focus:text-sm focus:font-black focus:no-underline focus-visible:ring-2 focus-visible:outline-none",
        "focus:bg-navy focus:text-ivory",
        "dark:focus:bg-gold dark:focus:text-navy-deep",
      )}
    >
      رد شدن به محتوای اصلی
    </a>
  );
}
