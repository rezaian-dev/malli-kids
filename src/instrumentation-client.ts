// 🌗 Boot the real storefront key (`malli_theme`), never the generic `theme`.
// An explicit light preference must not be overwritten by prefers-color-scheme.
try {
  const themeKey = "malli_theme";
  const resolvedKey = "malli_theme_resolved";
  const cookieAge = String(60 * 60 * 24 * 180);
  const readCookie = (key: string) => {
    const hit = document.cookie
      .split("; ")
      .find((part) => part.startsWith(`${key}=`));
    if (!hit) return "";
    try {
      return decodeURIComponent(hit.slice(key.length + 1));
    } catch {
      return hit.slice(key.length + 1);
    }
  };

  const saved =
    window.localStorage.getItem(themeKey) || readCookie(themeKey) || "system";
  const theme =
    saved === "light" || saved === "dark" || saved === "system"
      ? saved
      : "system";
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const resolved = dark ? "dark" : "light";
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = resolved;
  document.cookie = `${themeKey}=${encodeURIComponent(theme)}; path=/; max-age=${cookieAge}; samesite=lax`;
  document.cookie = `${resolvedKey}=${resolved}; path=/; max-age=${cookieAge}; samesite=lax`;
} catch {}

export {};
