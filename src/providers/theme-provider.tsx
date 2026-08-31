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

function readClientResolvedTheme() {
  if (typeof document === "undefined") return "light" as Resolved;
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

// 🌗 Keep the first paint in sync with the saved theme. ✨
export function ThemeProvider({
  children,
  initialTheme = "system",
}: {
  children: ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(() => readClientTheme(initialTheme));
  const [resolved, setResolved] = useState<Resolved>(readClientResolvedTheme);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const nextTheme = readClientTheme(initialTheme);
      const nextResolved = resolveThemePreference(nextTheme, mq.matches);
      const root = document.documentElement;

      root.classList.toggle("dark", nextResolved === "dark");
      root.style.colorScheme = nextResolved;
      writeCookie(THEME_KEY, encodeURIComponent(nextTheme));
      setThemeState(nextTheme);
      setResolved(nextResolved);
    };

    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [initialTheme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch {}

    const nextResolved = resolveThemePreference(
      nextTheme,
      window.matchMedia("(prefers-color-scheme: dark)").matches,
    );

    const root = document.documentElement;
    root.classList.toggle("dark", nextResolved === "dark");
    root.style.colorScheme = nextResolved;
    writeCookie(THEME_KEY, encodeURIComponent(nextTheme));
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
