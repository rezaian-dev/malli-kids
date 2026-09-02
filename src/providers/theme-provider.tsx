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

function readStoredTheme(fallback: ThemePreference): ThemePreference {
  try {
    return readThemePreference(localStorage.getItem(THEME_KEY) ?? undefined);
  } catch {
    return fallback; // localStorage blocked (private mode, etc.)
  }
}

// Swapping `.dark` re-triggers every `transition-colors` on the page.
// Freezing transitions for one paint makes the swap instant instead of a
// page-wide colour wipe.
function applyDarkClass(dark: boolean) {
  const root = document.documentElement;
  if (root.classList.contains("dark") === dark) return;
  root.classList.add("theme-transitioning");
  root.classList.toggle("dark", dark);
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.classList.remove("theme-transitioning")),
  );
}

// Applies + persists a theme in one place: DOM class, `color-scheme`,
// localStorage (read by the anti-flash script on the next page load) and
// cookies (read by the server on the next SSR render).
function persistTheme(theme: ThemePreference, resolved: ResolvedTheme) {
  applyDarkClass(resolved === "dark");
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
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const resolved = resolveThemePreference(next, systemDark);
    persistTheme(next, resolved);
    setThemeState(next);
    setResolvedTheme(resolved);
  }, []);

  useEffect(() => {
    // Reconcile with localStorage once on mount — it's the freshest source
    // (e.g. changed in another tab while this one was closed) and may
    // differ from the cookie the server rendered `initialTheme` from. The
    // same resync also answers a live OS theme change and a theme change
    // made in another tab, so both listeners below just call it.
    const resync = () => setTheme(readStoredTheme(initialTheme));
    resync();

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_KEY) resync();
    };

    media.addEventListener("change", resync);
    window.addEventListener("storage", onStorage);
    return () => {
      media.removeEventListener("change", resync);
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
