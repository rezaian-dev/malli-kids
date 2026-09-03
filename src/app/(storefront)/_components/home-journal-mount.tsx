"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const HomeJournal = dynamic(
  () => import("./home-journal").then((mod) => mod.HomeJournal),
  {
    ssr: false,
    loading: () => (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full shrink-0 sm:w-1/3" />
        ))}
      </div>
    ),
  },
);

// 📚 Defers the embla carousel (below the fold, autoplay) out of the
// homepage's initial client bundle — the slides themselves stay real,
// server-rendered content (`HomeJournalSlides`, a DB-backed Server
// Component) passed in as children by `sections/stories.tsx`.
export function HomeJournalMount({ children }: { children: ReactNode }) {
  return <HomeJournal>{children}</HomeJournal>;
}
