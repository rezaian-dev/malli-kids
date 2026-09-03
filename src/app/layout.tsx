import type { ReactNode } from "react";
import type { Viewport } from "next";
import { cookies } from "next/headers";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";
import { StoreProvider } from "@/providers/store-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { JsonLd } from "@/components/shared/json-ld";
import { getRootMetadata, organizationSchema, websiteSchema } from "@/lib/seo";
import { readStoreBootstrap } from "@/lib/storefront-state";
import { getSessionUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import "./globals.css";

// 🪶 Single variable-font files replace the old per-weight woff2 sets: one
// download (~108KB) covers the whole 100–900 axis instead of up to six
// ~50KB static files stacking up on pages that use several weights (the
// homepage alone was shipping all six — ~300KB of fonts before this).
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

// 🎨 Mirrors the `--background`/`--foreground` tokens in globals.css, inlined
// in <head> so the shell paints on-theme the instant next-themes' own
// pre-paint script sets the `.dark` class — no server-resolved theme needed.
const CRITICAL_CSS =
  "html{background:#ece6dc;color:#0e2a47;color-scheme:light}" +
  "html.dark{background:#041427;color:#fff8ec;color-scheme:dark}" +
  "body{background:inherit;color:inherit}";

// 🔄 Gold route-change bar (RTL-anchored in globals.css).
const TOP_LOADER = {
  color: "#d9b77f",
  height: 3,
  showSpinner: false,
  speed: 240,
  crawlSpeed: 110,
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  shadow: "0 0 14px rgba(217,183,127,.85), 0 0 6px rgba(193,147,87,.9)",
  zIndex: 9999,
} as const;

export const metadata = getRootMetadata();

// 🎨 No cookie-driven theme on the server anymore (next-themes owns that
// client-side), so the browser is told about both variants and picks
// whichever matches the OS preference until the app's own script runs.
export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ece6dc" },
    { media: "(prefers-color-scheme: dark)", color: "#061728" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [jar, user] = await Promise.all([cookies(), getSessionUser()]);
  const initialState = readStoreBootstrap((name) => jar.get(name)?.value, user);

  return (
    <html
      lang="fa-IR"
      dir="rtl"
      data-scroll-behavior="smooth"
      data-auth={user ? "user" : "guest"}
      className={cn(vazir.variable, playfair.variable, "scrollbar-gutter-stable")}
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
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <NextTopLoader {...TOP_LOADER} />

        <ThemeProvider>
          <StoreProvider initialState={initialState}>
            {children}
            <Toaster />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
