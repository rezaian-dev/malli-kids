import type { ReactNode } from "react";
import { cookies } from "next/headers";
import NextTopLoader from "nextjs-toploader";
import "../storefront.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeaderSpacer } from "@/components/layout/header-spacer";
import { StorefrontEnhancements } from "@/components/layout/storefront-enhancements";
import { BackgroundScene } from "@/components/shared/background-scene";
import { SkipLink } from "@/components/shared/skip-link";
import { JsonLd } from "@/components/shared/json-ld";
import { PageReveal } from "@/components/motion/static";
import { AuthProvider } from "@/providers/auth-provider";
import { CartStoreProvider } from "@/providers/cart-store-provider";
import { FavoritesStoreProvider } from "@/providers/favorites-store-provider";
import { CampaignProvider } from "@/providers/campaign-provider";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { readStoreBootstrap } from "@/lib/storefront-state";
import { getSession, getSessionUser } from "@/lib/auth/session";
import { getCampaign } from "@/lib/shop/settings";
import { getActiveBanner } from "@/lib/shop/banners";
import { getFavoriteIds } from "@/lib/shop/favorites";

// Gold route-change bar (RTL-anchored in globals.css).
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

// Shared storefront shell for every public page.
// Owns the storefront session/cart/campaign bootstrap so /admin never pays
// for providers and fetches it never consumes.
export default async function StorefrontLayout({
  children,
}: {
  children: ReactNode;
}) {
  const jar = await cookies();
  const user = await getSessionUser();
  const [campaign, banner] = await Promise.all([
    getCampaign(),
    getActiveBanner(),
  ]).catch((err) => {
    console.warn(
      "[layout] campaign/banner load failed — using defaults:",
      (err as Error).message,
    );
    return [null, null] as const;
  });
  const session = user ? await getSession() : null;
  const favorites = session ? await getFavoriteIds(session.user.id) : [];
  const initialState = readStoreBootstrap(
    (name) => jar.get(name)?.value,
    user,
    campaign ?? { active: false, percent: 0, title: "" },
    banner,
  );

  return (
    <AuthProvider initialUser={user}>
      <CartStoreProvider initialCart={initialState.cart}>
        <FavoritesStoreProvider initialFavorites={favorites}>
          <CampaignProvider
            campaign={initialState.campaign}
            banner={initialState.banner}
          >
            <JsonLd data={organizationSchema()} />
            <JsonLd data={websiteSchema()} />
            <NextTopLoader {...TOP_LOADER} />
            <SkipLink />
            <BackgroundScene />
            <Header />
            <HeaderSpacer />
            <main id="main-content" className="relative z-10 pb-10 sm:pb-16">
              <PageReveal>{children}</PageReveal>
            </main>
            <Footer />
            <StorefrontEnhancements />
          </CampaignProvider>
        </FavoritesStoreProvider>
      </CartStoreProvider>
    </AuthProvider>
  );
}
