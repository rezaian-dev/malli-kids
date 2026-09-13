"use client";

import "@/lib/zod-config";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { signOutAction } from "@/lib/auth/actions";
import type { User } from "@/types";

// Update client identity only after the server session changes.
type Ctx = {
  user: User | null;
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  login: (user: User) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [authOpen, setAuthOpen] = useState(false);

  // Mirrors an already-created server session into UI state
  const login = useCallback(
    (nextUser: User) => {
      setUser(nextUser);
      setAuthOpen(false);
      router.refresh();
    },
    [router],
  );

  const updateUser = useCallback(
    (patch: Partial<User>) =>
      setUser((current) => (current ? { ...current, ...patch } : current)),
    [],
  );

  // Revokes the server session first, then clears UI state
  const logout = useCallback(async () => {
    const result = await signOutAction();
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setUser(null);
    setAuthOpen(false);
    router.refresh();
  }, [router]);

  return (
    <AuthCtx.Provider
      value={{ user, authOpen, setAuthOpen, login, updateUser, logout }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("AuthProvider missing");
  return ctx;
}
