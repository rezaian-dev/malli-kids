import { Loader2 } from "lucide-react";

export default function CollabLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center"
    >
      <Loader2 className="text-gold size-8 animate-spin" />
      <p className="text-navy/70 dark:text-wheat text-sm font-bold">
        در حال بارگذاری همکاری با ما…
      </p>
    </div>
  );
}
