"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STORAGE } from "@/lib/constants";
import "./theme.css";

// 🎨 Same light/dark paint as the root layout's CRITICAL_CSS, so this page
// never flashes the wrong theme before the script below runs.
const CRITICAL_CSS =
  "html{background:#ece6dc;color:#0e2a47;color-scheme:light}" +
  "html.dark{background:#041427;color:#fff8ec;color-scheme:dark}" +
  "body{background:inherit;color:inherit}";

// 🌗 ThemeProvider never mounts here (the root layout it lives in is what
// just crashed), so this page has to pick the `.dark` class itself — same
// source of truth next-themes uses: the stored preference, else the OS.
const THEME_SCRIPT = `(function(){try{var m=localStorage.getItem(${JSON.stringify(
  STORAGE.theme,
)});var d=m==="dark"||(m!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;

// 🧯 Root layout failed — must render its own <html>/<body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fa-IR" dir="rtl" suppressHydrationWarning>
      <head>
        {/* 🌗 Blocking inline script — must run before body paints */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <style>{CRITICAL_CSS}</style>
      </head>
      <body
        className="text-navy dark:text-ivory flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center"
        suppressHydrationWarning
      >
        <span className="bg-rose/10 text-rose grid size-16 place-items-center rounded-3xl">
          <TriangleAlert className="size-8" />
        </span>
        <div>
          <h1 className="text-2xl font-black">مشکلی پیش آمده</h1>
          <p className="text-navy/70 dark:text-wheat mt-2 max-w-sm text-sm leading-7">
            برنامه نتوانست این صفحه را بسازد. صفحه را بارگذاری کنید.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="navy"
            size="pill"
            onClick={() => reset()}
          >
            تلاش دوباره
          </Button>
          <Button
            type="button"
            variant="outline"
            size="pill"
            onClick={() => window.location.reload()}
          >
            بارگذاری صفحه
          </Button>
        </div>
      </body>
    </html>
  );
}
