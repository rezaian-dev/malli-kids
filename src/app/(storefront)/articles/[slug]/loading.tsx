import { Skeleton } from "@/components/ui/skeleton";

/** 🦴 Mirrors `ArticleView`'s header (crumb/tag/title) + cover + body shape
 *  — this route had no loading state at all before. */
export default function ArticleLoading() {
  return (
    <article
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="در حال بارگذاری مقاله…"
      className="xs:px-4 container mx-auto w-full max-w-3xl px-3 py-8 sm:px-5 lg:px-7"
    >
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-4 h-5 w-20 rounded-full" />
      <Skeleton className="mt-3 h-9 w-full max-w-md" />
      <Skeleton className="mt-6 h-64 w-full rounded-3xl" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
        <Skeleton className="h-4 w-2/3" />
      </div>
    </article>
  );
}
