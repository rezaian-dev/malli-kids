import type { ReactNode } from "react";
import type { Viewport } from "next";
import { cookies, headers } from "next/headers";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";
import { AuthProvider } from "@/providers/auth-provider";
import { CartStoreProvider } from "@/providers/cart-store-provider";
import { FavoritesStoreProvider } from "@/providers/favorites-store-provider";
import { CampaignProvider } from "@/providers/campaign-provider";
import { MotionProvider } from "@/components/motion";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToasterMount } from "@/components/ui/toaster-mount";
import { JsonLd } from "@/components/shared/json-ld";
import { getRootMetadata, organizationSchema, websiteSchema } from "@/lib/seo";
import { readStoreBootstrap } from "@/lib/storefront-state";
import { getSession, getSessionUser } from "@/lib/auth/session";
import { ensureSeeded } from "@/lib/db/seed";
import { getCampaign } from "@/lib/shop/settings";
import { getActiveBanner } from "@/lib/shop/banners";
import { getFavoriteIds } from "@/lib/shop/favorites";
import { cn } from "@/lib/utils";
// 🧱 Shared tokens/base only — each route group's layout imports its own
// stylesheet, so no utilities are generated here
import "./theme.css";

// 🪶 Variable fonts — one file covers the whole weight axis
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

// 🎨 Inline theme colors — paints on-theme the instant .dark is set
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

// 🎨 next-themes owns the theme client-side; the browser picks until then
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
  await ensureSeeded();
  const jar = await cookies();
  const pathname = (await headers()).get("x-malli-pathname") ?? "";
  const isAdmin = pathname.startsWith("/admin");
  const user = await getSessionUser();
  // 🎛️ Skip storefront chrome for admin — one-shot paint, no extra round-trips
  const [campaign, banner] = isAdmin
    ? [null, null]
    : await Promise.all([getCampaign(), getActiveBanner()]);
  const session = !isAdmin && user ? await getSession() : null;
  const favorites = session ? await getFavoriteIds(session.user.id) : [];
  const initialState = readStoreBootstrap(
    (name) => jar.get(name)?.value,
    user,
    campaign ?? { active: false, percent: 0, title: "" },
    banner,
  );

  return (
    <html
      lang="fa-IR"
      dir="rtl"
      data-scroll-behavior="smooth"
      data-auth={user ? "user" : "guest"}
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
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        {isAdmin ? null : <NextTopLoader {...TOP_LOADER} />}

        {/* ♿ reducedMotion="user" respects prefers-reduced-motion */}
        <MotionProvider>
          <ThemeProvider>
            <AuthProvider initialUser={user}>
              <CartStoreProvider initialCart={initialState.cart}>
                <FavoritesStoreProvider initialFavorites={favorites}>
                  <CampaignProvider
                    campaign={initialState.campaign}
                    banner={initialState.banner}
                  >
                    {children}
                    <ToasterMount />
                  </CampaignProvider>
                </FavoritesStoreProvider>
              </CartStoreProvider>
            </AuthProvider>
          </ThemeProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
