"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";
import { STORAGE } from "@/lib/constants";

// 🌗 Thin next-themes wrapper — the single place the app's dark-mode defaults
// live. `attribute="class"` toggles Tailwind's `.dark` class on `<html>`
// (see `@custom-variant dark` in theme.css); next-themes injects its own
// pre-paint script, so there's no flash and no manual cookie/localStorage
// plumbing to maintain here.
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey={STORAGE.theme}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
