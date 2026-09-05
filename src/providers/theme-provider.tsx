"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";
import { STORAGE } from "@/lib/constants";

// 🌗 Single place for dark-mode defaults — next-themes handles the
// pre-paint script, no flash
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
