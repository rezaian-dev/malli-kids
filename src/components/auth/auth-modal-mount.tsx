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

    const preload = () => void import("./auth-modal");
    const hasIdle = typeof window.requestIdleCallback === "function";
    const id = hasIdle
      ? window.requestIdleCallback(preload, { timeout: 4000 })
      : window.setTimeout(preload, 2500);

    return () => {
      if (hasIdle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, [mounted]);

  return mounted ? <AuthModal /> : null;
}
