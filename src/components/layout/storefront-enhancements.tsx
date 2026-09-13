"use client";

import dynamic from "next/dynamic";

const ClickProgress = dynamic(
  () => import("./click-progress").then((m) => m.ClickProgress),
  { ssr: false },
);
const BackToTop = dynamic(
  () => import("./back-to-top").then((m) => m.BackToTop),
  { ssr: false },
);
const AuthModalMount = dynamic(
  () =>
    import("@/components/auth/auth-modal-mount").then((m) => m.AuthModalMount),
  { ssr: false },
);
const ChatWidget = dynamic(
  () => import("@/components/chat/chat-widget").then((m) => m.ChatWidget),
  { ssr: false },
);

// Keep storefront helpers ready without visual fallback swaps.
export function StorefrontEnhancements() {
  return (
    <>
      <ClickProgress />
      <BackToTop />
      <AuthModalMount />
      <ChatWidget />
    </>
  );
}
