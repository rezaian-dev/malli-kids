try {
  const stored = window.localStorage.getItem("theme");
  const followsSystem = !stored || stored === "system";
  const dark =
    stored === "dark" ||
    (followsSystem &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
} catch {}

export {};
