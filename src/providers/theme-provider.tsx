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

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

function prefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function readStoredTheme(fallback: ThemePreference): ThemePreference {
  try {
    return readThemePreference(localStorage.getItem(THEME_KEY) ?? undefined);
  } catch {
    return fallback;
  }
}

// 🎞️ Toggling `.dark` cascades every `transition-colors` on the page;
// suppressing transitions for one frame swaps it instantly instead of a
// page-wide colour wipe. Not part of Tailwind's dark-mode guide — a small
// addition on top of its documented class strategy.
function setDarkClass(dark: boolean) {
  const root = document.documentElement;
  if (root.classList.contains("dark") === dark) return;
  root.classList.add("theme-transitioning");
  root.classList.toggle("dark", dark);
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.classList.remove("theme-transitioning")),
  );
}

// The one place that applies + persists a theme: DOM class, `color-scheme`,
// localStorage (read by the inline anti-FOUC script on the *next* load) and
// the cookie (read by the server on the *next* SSR pass).
function commit(theme: ThemePreference, resolved: ResolvedTheme) {
  setDarkClass(resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
  writeCookie(THEME_KEY, encodeURIComponent(theme));
  writeCookie(THEME_RESOLVED_KEY, resolved);
}

export function ThemeProvider({
  children,
  initialTheme = "system",
  initialResolved = "light",
}: {
  children: ReactNode;
  initialTheme?: ThemePreference;
  initialResolved?: ResolvedTheme;
}) {
  const [theme, setThemeState] = useState(initialTheme);
  const [resolvedTheme, setResolvedTheme] = useState(initialResolved);

  const setTheme = useCallback((next: ThemePreference) => {
    const resolved = resolveThemePreference(next, prefersDark());
    commit(next, resolved);
    setThemeState(next);
    setResolvedTheme(resolved);
  }, []);

  useEffect(() => {
    // Reconcile with localStorage once on mount — it's the freshest source
    // (e.g. changed from another tab while this one was closed) and may
    // differ from the cookie the server rendered `initialTheme` from.
    setTheme(readStoredTheme(initialTheme));

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onMediaChange = () => {
      const stored = readStoredTheme(initialTheme);
      if (stored === "system") setTheme(stored);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_KEY) setTheme(readStoredTheme(initialTheme));
    };

    media.addEventListener("change", onMediaChange);
    window.addEventListener("storage", onStorage);
    return () => {
      media.removeEventListener("change", onMediaChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [initialTheme, setTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
