"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useStore } from "@/providers/store-provider";

// 🚪 Lazy mount the auth modal only when it matters. ✨
const AuthModal = dynamic(
  () => import("./auth-modal").then((m) => m.AuthModal),
  { ssr: false },
);

export function AuthModalMount() {
  const { authOpen } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (authOpen) setMounted(true);
  }, [authOpen]);

  useEffect(() => {
    if (mounted) return;

    // 🖱️ Preload on the first sign of a real visitor (pointer/touch/key),
    // not a blind timer — a blind timeout still fires during an automated
    // page-load trace (e.g. Lighthouse) with no one there to use it, which
    // only shows up as JS shipped-but-never-executed on that run.
    const preload = () => void import("./auth-modal");
    const events: Array<[string, AddEventListenerOptions]> = [
      ["pointerdown", { passive: true }],
      ["touchstart", { passive: true }],
      ["keydown", {}],
      ["scroll", { passive: true }],
    ];
    const trigger = () => {
      preload();
      events.forEach(([type]) => window.removeEventListener(type, trigger));
    };
    events.forEach(([type, opts]) =>
      window.addEventListener(type, trigger, { ...opts, once: true }),
    );

    return () => {
      events.forEach(([type]) => window.removeEventListener(type, trigger));
    };
  }, [mounted]);

  return mounted ? <AuthModal /> : null;
}
