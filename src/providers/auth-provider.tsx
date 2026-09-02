"use client";

import "@/lib/zod-config";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { signOutAction } from "@/lib/auth/actions";
import type { User } from "@/types";

// 🔐 The one client-side mirror of "who's signed in" — seeded from
// `getSessionUser()` server-side (see `app/layout.tsx`) and only ever
// updated after a real server action (sign in/up/out, profile edit) already
// changed the actual session. The server stays the source of truth; this
// just lets the UI react immediately instead of waiting on a full
// navigation. `authOpen` (the login/register dialog) rides along here since
// almost every place that opens it is reacting to `user` being null.
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
  const [user, setUser] = useState(initialUser);
  const [authOpen, setAuthOpen] = useState(false);

  // 🔐 Called after a server action (sign in/up) already created the real,
  // httpOnly-cookie-backed session — this only mirrors it into UI state.
  const login = useCallback((nextUser: User) => {
    setUser(nextUser);
    setAuthOpen(false);
  }, []);

  const updateUser = useCallback(
    (patch: Partial<User>) =>
      setUser((current) => (current ? { ...current, ...patch } : current)),
    [],
  );

  // 🔐 Revokes the real session server-side first, then clears UI state.
  const logout = useCallback(async () => {
    await signOutAction();
    setUser(null);
  }, []);

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
