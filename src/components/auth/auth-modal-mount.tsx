"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";

// 🚪 Lazy mount the auth modal only when it matters. ✨
const AuthModal = dynamic(
  () => import("./auth-modal").then((m) => m.AuthModal),
  { ssr: false },
);

export function AuthModalMount() {
  const { authOpen } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (authOpen) setMounted(true);
  }, [authOpen]);

  useEffect(() => {
    if (mounted) return;

    // 🖱️ Preload on a real visitor signal, not a timer — a blind timeout
    // fires during automated traces with nobody there
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
