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
import {
  buildThemeScript,
  readResolvedTheme,
  readStoreBootstrap,
  readThemePreference,
  resolveInitialTheme,
  THEME_KEY,
  THEME_RESOLVED_KEY,
} from "@/lib/storefront-state";
import { cn } from "@/lib/utils";
import "./globals.css";

// ⚠️ `next/font` is a build-time transform — these lists have to stay
// literal, they can't be generated from a weights array.
const vazir = localFont({
  src: [
    { path: "../fonts/Vazirmatn-Regular.woff2", weight: "400" },
    { path: "../fonts/Vazirmatn-Medium.woff2", weight: "500" },
    { path: "../fonts/Vazirmatn-SemiBold.woff2", weight: "600" },
    { path: "../fonts/Vazirmatn-Bold.woff2", weight: "700" },
    { path: "../fonts/Vazirmatn-ExtraBold.woff2", weight: "800" },
    { path: "../fonts/Vazirmatn-Black.woff2", weight: "900" },
  ],
  variable: "--font-vazir",
  display: "swap",
});

const playfair = localFont({
  src: [
    { path: "../fonts/PlayfairDisplay-Regular.woff2", weight: "400" },
    { path: "../fonts/PlayfairDisplay-Bold.woff2", weight: "700" },
  ],
  variable: "--font-display",
  display: "swap",
});

// 🎨 Mirrors the `--background`/`--foreground` tokens in globals.css, inlined
// in <head> so the shell paints on-theme before the stylesheet lands.
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

// 🍪 The single place the shell resolves its theme. Both `generateViewport`
// and the layout need it, and `cookies()` is request-cached, so reading it
// from each costs nothing. Returns the jar too — the layout also boots the
// store from the same cookies.
async function readShellCookies() {
  const jar = await cookies();
  const theme = readThemePreference(jar.get(THEME_KEY)?.value);
  const resolved = resolveInitialTheme(
    theme,
    readResolvedTheme(jar.get(THEME_RESOLVED_KEY)?.value),
  );

  return { jar, theme, resolved };
}

export async function generateViewport(): Promise<Viewport> {
  const { resolved } = await readShellCookies();

  return {
    colorScheme: resolved,
    // Browser chrome sits a shade deeper than the page itself in dark mode.
    themeColor: resolved === "dark" ? "#061728" : "#ece6dc",
  };
}

// 🌗 Hydrate from cookies first so the shell matches before React wakes up. ✨
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { jar, theme, resolved } = await readShellCookies();
  const initialState = readStoreBootstrap((name) => jar.get(name)?.value);

  return (
    <html
      lang="fa-IR"
      dir="rtl"
      data-scroll-behavior="smooth"
      className={cn(
        vazir.variable,
        playfair.variable,
        "scrollbar-gutter-stable",
        resolved === "dark" && "dark",
      )}
      style={{ colorScheme: resolved }}
      suppressHydrationWarning
    >
      <head>
        <style>{CRITICAL_CSS}</style>
        <script dangerouslySetInnerHTML={{ __html: buildThemeScript() }} />
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

        <ThemeProvider initialTheme={theme} initialResolved={resolved}>
          <StoreProvider initialState={initialState}>
            {children}
            <Toaster />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
