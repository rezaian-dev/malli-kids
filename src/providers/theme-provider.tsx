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

function readStoredTheme(fallback: Theme) {
  if (typeof window === "undefined") return fallback;

  try {
    return readThemePreference(
      window.localStorage.getItem(THEME_KEY) ?? undefined,
    );
  } catch {
    return fallback;
  }
}

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function disableThemeTransitions() {
  const root = document.documentElement;
  root.classList.add("theme-transitioning");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove("theme-transitioning");
    });
  });
}

function applyTheme(nextTheme: Theme, nextResolved: Resolved) {
  const root = document.documentElement;
  const isDark = nextResolved === "dark";
  if (root.classList.contains("dark") !== isDark) {
    disableThemeTransitions();
    root.classList.toggle("dark", isDark);
  }
  if (root.style.colorScheme !== nextResolved) {
    root.style.colorScheme = nextResolved;
  }
  writeCookie(THEME_KEY, encodeURIComponent(nextTheme));
  writeCookie(THEME_RESOLVED_KEY, nextResolved);
}

export function ThemeProvider({
  children,
  initialTheme = "system",
  initialResolved = "light",
}: {
  children: ReactNode;
  initialTheme?: Theme;
  initialResolved?: Resolved;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [resolved, setResolved] = useState<Resolved>(initialResolved);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const sync = (nextTheme: Theme) => {
      const nextResolved = resolveThemePreference(nextTheme, mq.matches);
      applyTheme(nextTheme, nextResolved);
      setThemeState(nextTheme);
      setResolved(nextResolved);
    };

    sync(readStoredTheme(initialTheme));

    const onScheme = () => {
      const current = readStoredTheme(initialTheme);
      if (current !== "system") return;
      sync(current);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_KEY) return;
      sync(readStoredTheme(initialTheme));
    };

    mq.addEventListener("change", onScheme);
    window.addEventListener("storage", onStorage);
    return () => {
      mq.removeEventListener("change", onScheme);
      window.removeEventListener("storage", onStorage);
    };
  }, [initialTheme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch {}

    const nextResolved = resolveThemePreference(nextTheme, systemPrefersDark());
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
