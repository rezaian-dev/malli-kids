import dynamic from "next/dynamic";

// 🪶 Every enhancement below is interaction-only (scroll progress, back-to-top,
// auth dialog, support bubble): nothing paints above the fold on load, so each
// rides in its own deferred client chunk instead of the initial bundle. All
// mount `position: fixed` (or render null until used), so their late arrival
// can never shift layout (no CLS).
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

// ✨ Keep storefront helpers ready without visual fallback swaps. 🪶
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
