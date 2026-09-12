"use client";

import dynamic from "next/dynamic";

// 🍞 Toasts only ever fire on user interaction (long after first paint), so
// `sonner` rides in its own deferred client chunk instead of the initial
// bundle. A tiny client mount (same pattern as `AuthModalMount`) because
// `next/dynamic` with `ssr: false` is not allowed directly in the Server
// Component root layout.
const Toaster = dynamic(() => import("./sonner").then((m) => m.Toaster), {
  ssr: false,
});

export function ToasterMount() {
  return <Toaster />;
}
