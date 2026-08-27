import Link from "next/link";
import { cn } from "@/lib/utils";

export function CtaLinks() {
  return (
    <div className="container mx-auto mb-10 flex max-w-5xl flex-wrap gap-3 px-3 sm:px-5 lg:px-7">
      <Link
        href="/shop"
        className={cn(
          "inline-flex rounded-full px-6 py-3 font-black transition-transform hover:-translate-y-0.5",
          "bg-navy text-ivory shadow-navy/20 shadow-lg",
        )}
      >
        مشاهده کالکشن
      </Link>
    </div>
  );
}
