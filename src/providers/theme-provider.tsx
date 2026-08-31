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

type Theme = "light" | "dark" | "system";
type Resolved = "light" | "dark";

const KEY = "theme";

const Ctx = createContext<{ theme: Theme; resolvedTheme: Resolved; setTheme: (t: Theme) => void }>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

// 🌗 Tiny theme provider without extra script tags.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    try {
      const s = localStorage.getItem(KEY);
      return s === "light" || s === "dark" || s === "system" ? s : "system";
    } catch {
      return "system";
    }
  });
  const [resolved, setResolved] = useState<Resolved>("light");

  useEffect(() => {
    const apply = () => {
      const r: Resolved =
        theme === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : theme;
      document.documentElement.classList.toggle("dark", r === "dark");
      document.documentElement.style.colorScheme = r;
      setResolved(r);
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    try {
      localStorage.setItem(KEY, t);
    } catch {
      
    }
    setThemeState(t);
  }, []);

  const value = useMemo(() => ({ theme, resolvedTheme: resolved, setTheme }), [theme, resolved, setTheme]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  return useContext(Ctx);
}
