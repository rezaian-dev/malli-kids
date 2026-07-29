import type { ReactNode } from "react";
import "../storefront.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeaderSpacer } from "@/components/layout/header-spacer";
import { StorefrontEnhancements } from "@/components/layout/storefront-enhancements";
import { BackgroundScene } from "@/components/shared/background-scene";
import { SkipLink } from "@/components/shared/skip-link";

// 🛍️ Shared storefront shell for every public page.
export default function StorefrontLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <SkipLink />
      <BackgroundScene />
      <Header />
      <HeaderSpacer />
      <main id="main-content" className="relative z-10 pb-10 sm:pb-16">
        {children}
      </main>
      <Footer />
      <StorefrontEnhancements />
    </>
  );
}
