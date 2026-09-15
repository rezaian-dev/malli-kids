import type { ReactNode } from "react";
import type { Viewport } from "next";
import localFont from "next/font/local";
import { MotionProvider } from "@/components/motion";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToasterMount } from "@/components/ui/toaster-mount";
import { getRootMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
// Route layouts load utilities; the root loads shared tokens only.
import "./theme.css";

// Variable fonts — one file covers the whole weight axis
const vazir = localFont({
  src: "../fonts/Vazirmatn-Variable.woff2",
  weight: "100 900",
  variable: "--font-vazir",
  display: "swap",
});

const playfair = localFont({
  src: "../fonts/PlayfairDisplay-Variable.woff2",
  weight: "400 900",
  variable: "--font-display",
  display: "swap",
});

// Inline theme colors — paints on-theme the instant .dark is set
const CRITICAL_CSS =
  "html{background:#ece6dc;color:#0e2a47;color-scheme:light}" +
  "html.dark{background:#041427;color:#fff8ec;color-scheme:dark}" +
  "body{background:inherit;color:inherit}";

export const metadata = getRootMetadata();

// next-themes owns the theme client-side; the browser picks until then
export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ece6dc" },
    { media: "(prefers-color-scheme: dark)", color: "#061728" },
  ],
};

// Static shell — no cookies/headers here so route groups keep ownership of
// their own data and providers (see (storefront)/layout.tsx and admin/).
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="fa-IR"
      dir="rtl"
      data-scroll-behavior="smooth"
      className={cn(
        vazir.variable,
        playfair.variable,
        "scrollbar-gutter-stable",
      )}
      suppressHydrationWarning
    >
      <head>
        <style>{CRITICAL_CSS}</style>
      </head>
      <body
        className={cn(
          vazir.className,
          "text-navy dark:text-ivory min-h-dvh antialiased data-scroll-locked:mr-0!",
        )}
        suppressHydrationWarning
      >
        {/* reducedMotion="user" respects prefers-reduced-motion */}
        <MotionProvider>
          <ThemeProvider>
            {children}
            <ToasterMount />
          </ThemeProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
