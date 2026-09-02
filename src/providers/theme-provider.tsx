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

const DARK_QUERY = "(prefers-color-scheme: dark)";

type ThemeState = { theme: ThemePreference; resolvedTheme: ResolvedTheme };
type ThemeContextValue = ThemeState & {
  setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

// localStorage throws in private mode — the caller's value stands.
function readStoredTheme(fallback: ThemePreference): ThemePreference {
  try {
    return readThemePreference(localStorage.getItem(THEME_KEY) ?? undefined);
  } catch {
    return fallback;
  }
}

// Paint it. Toggling `.dark` re-runs every `transition-colors` on the page,
// so transitions are frozen for one paint: the swap lands instantly instead
// of wiping colour across the whole page.
function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  const dark = resolved === "dark";

  root.style.colorScheme = resolved;
  if (root.classList.contains("dark") === dark) return;

  root.classList.add("theme-transitioning");
  root.classList.toggle("dark", dark);
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.classList.remove("theme-transitioning")),
  );
}

// Remember it: localStorage for the anti-flash script on the next load,
// cookies for the server on the next SSR render.
function saveTheme(theme: ThemePreference, resolved: ResolvedTheme) {
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
  const [state, setState] = useState<ThemeState>({
    theme: initialTheme,
    resolvedTheme: initialResolved,
  });

  const setTheme = useCallback((theme: ThemePreference) => {
    const resolvedTheme = resolveThemePreference(
      theme,
      window.matchMedia(DARK_QUERY).matches,
    );

    applyTheme(resolvedTheme);
    saveTheme(theme, resolvedTheme);
    setState({ theme, resolvedTheme });
  }, []);

  useEffect(() => {
    // localStorage is the freshest source: another tab may have changed it
    // since the server rendered `initialTheme` off the cookie. The same
    // resync answers an OS theme change and a change from another tab.
    const resync = () => setTheme(readStoredTheme(initialTheme));
    resync();

    const media = window.matchMedia(DARK_QUERY);
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

  const value = useMemo(() => ({ ...state, setTheme }), [state, setTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
