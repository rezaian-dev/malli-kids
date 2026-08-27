import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Modal } from "@/components/overlays/auth-modal";
import { Drawer } from "@/components/overlays/cart-drawer";

// Storefront chrome. A route-group layout (the "(storefront)" segment is stripped
// from the URL) so every public page shares this shell without a runtime path check.
export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="relative z-10 bg-cream/70 pt-[7.25rem] pb-10 sm:pt-32 sm:pb-16 dark:bg-transparent">{children}</main>
      <Footer />
      <Modal />
      <Drawer />
    </>
  );
}
