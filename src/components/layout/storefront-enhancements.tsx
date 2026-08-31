"use client";

import dynamic from "next/dynamic";

const ClickProgress = dynamic(
  () => import("./click-progress").then((mod) => mod.ClickProgress),
  { ssr: false },
);
const BackToTop = dynamic(() => import("./back-to-top").then((mod) => mod.BackToTop), {
  ssr: false,
});
const AuthModalMount = dynamic(
  () => import("@/components/auth").then((mod) => mod.AuthModalMount),
  { ssr: false },
);

// ✨ Delay non-critical storefront helpers until hydration.
export function StorefrontEnhancements() {
  return (
    <>
      <ClickProgress />
      <BackToTop />
      <AuthModalMount />
    </>
  );
}
