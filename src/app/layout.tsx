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
import "./globals.css";

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

export const metadata = getRootMetadata();

export async function generateViewport(): Promise<Viewport> {
  const cookieStore = await cookies();
  const theme = readThemePreference(cookieStore.get(THEME_KEY)?.value);
  const resolved = resolveInitialTheme(
    theme,
    readResolvedTheme(cookieStore.get(THEME_RESOLVED_KEY)?.value),
  );

  return {
    colorScheme: resolved,
    themeColor: resolved === "dark" ? "#061728" : "#ece6dc",
  };
}

// 🌗 Hydrate from cookies first so the shell matches before React wakes up. ✨
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const initialTheme = readThemePreference(cookieStore.get(THEME_KEY)?.value);
  const initialResolved = resolveInitialTheme(
    initialTheme,
    readResolvedTheme(cookieStore.get(THEME_RESOLVED_KEY)?.value),
  );
  const initialState = readStoreBootstrap(
    (name) => cookieStore.get(name)?.value,
  );

  return (
    <html
      lang="fa-IR"
      dir="rtl"
      data-scroll-behavior="smooth"
      className={`${vazir.variable} ${playfair.variable} scrollbar-gutter-stable ${
        initialResolved === "dark" ? "dark" : ""
      }`}
      style={{ colorScheme: initialResolved }}
      suppressHydrationWarning
    >
      <head>
        <style>{`html{background:#ece6dc;color:#0e2a47;color-scheme:light}html.dark{background:#041427;color:#fff8ec;color-scheme:dark}body{background:inherit;color:inherit}`}</style>
        <script dangerouslySetInnerHTML={{ __html: buildThemeScript() }} />
      </head>
      <body
        className={`${vazir.className} text-navy dark:text-ivory min-h-dvh antialiased data-scroll-locked:mr-0!`}
        suppressHydrationWarning
      >
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <NextTopLoader
          color="#d9b77f"
          height={3}
          showSpinner={false}
          speed={240}
          crawlSpeed={110}
          easing="cubic-bezier(0.4, 0, 0.2, 1)"
          shadow="0 0 14px rgba(217,183,127,.85), 0 0 6px rgba(193,147,87,.9)"
          zIndex={9999}
        />
        <ThemeProvider
          initialTheme={initialTheme}
          initialResolved={initialResolved}
        >
          <StoreProvider initialState={initialState}>
            {children}
            <Toaster />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
