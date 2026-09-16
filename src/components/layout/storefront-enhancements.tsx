"use client";

import dynamic from "next/dynamic";
import { ChatWidget } from "@/components/chat/chat-widget";

const ClickProgress = dynamic(
  () => import("./click-progress").then((m) => m.ClickProgress),
  { ssr: false },
);
const BackToTop = dynamic(
  () => import("./back-to-top").then((m) => m.BackToTop),
  { ssr: false },
);
// Keep storefront helpers ready without visual fallback swaps.
export function StorefrontEnhancements() {
  return (
    <>
      <ClickProgress />
      <BackToTop />
      <ChatWidget />
    </>
  );
}
