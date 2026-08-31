import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeaderSpacer } from "@/components/layout/header-spacer";
import { ClickProgress } from "@/components/layout/click-progress";
import { BackToTop } from "@/components/layout/back-to-top";
import { BackgroundScene } from "@/components/shared/background-scene";
import { AuthModalMount } from "@/components/auth";

// 🛍️ Shared storefront shell for every public page.
export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BackgroundScene />
      <Header />
      <HeaderSpacer />
      <ClickProgress />
      <main className="relative z-10 pb-10 sm:pb-16">{children}</main>
      <Footer />
      <BackToTop />
      <AuthModalMount />
    </>
  );
}
