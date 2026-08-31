"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  readThemePreference,
  resolveThemePreference,
  THEME_KEY,
  THEME_RESOLVED_KEY,
  writeCookie,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/storefront-state";

type Theme = ThemePreference;
type Resolved = ResolvedTheme;

const Ctx = createContext<{
  theme: Theme;
  resolvedTheme: Resolved;
  setTheme: (t: Theme) => void;
}>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

function readClientTheme(fallback: Theme) {
  if (typeof window === "undefined") return fallback;

  try {
    return readThemePreference(window.localStorage.getItem(THEME_KEY) ?? undefined);
  } catch {
    return fallback;
  }
}

function readClientResolvedTheme(fallback: Resolved) {
  if (typeof document === "undefined") return fallback;
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(nextTheme: Theme, nextResolved: Resolved) {
  const root = document.documentElement;
  root.classList.toggle("dark", nextResolved === "dark");
  root.style.colorScheme = nextResolved;
  writeCookie(THEME_KEY, encodeURIComponent(nextTheme));
  writeCookie(THEME_RESOLVED_KEY, nextResolved);
}

// 🌗 Keep SSR, first paint and later toggles in the same theme lane. ✨
export function ThemeProvider({
  children,
  initialTheme = "system",
  initialResolved = "light",
}: {
  children: ReactNode;
  initialTheme?: Theme;
  initialResolved?: Resolved;
}) {
  const [theme, setThemeState] = useState<Theme>(() => readClientTheme(initialTheme));
  const [resolved, setResolved] = useState<Resolved>(() =>
    readClientResolvedTheme(initialResolved),
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const sync = () => {
      const nextTheme = readClientTheme(initialTheme);
      const nextResolved = resolveThemePreference(nextTheme, mq.matches);
      applyTheme(nextTheme, nextResolved);
      setThemeState(nextTheme);
      setResolved(nextResolved);
    };

    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [initialResolved, initialTheme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch {}

    const nextResolved = resolveThemePreference(
      nextTheme,
      window.matchMedia("(prefers-color-scheme: dark)").matches,
    );

    applyTheme(nextTheme, nextResolved);
    setThemeState(nextTheme);
    setResolved(nextResolved);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme: resolved, setTheme }),
    [theme, resolved, setTheme],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  return useContext(Ctx);
}
