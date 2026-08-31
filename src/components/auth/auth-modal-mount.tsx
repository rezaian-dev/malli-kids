"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useStore } from "@/providers/store-provider";

// 🚪 Lazy mount the auth modal only when it matters.
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

  return mounted ? <AuthModal /> : null;
}
