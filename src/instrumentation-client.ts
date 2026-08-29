/**
 * این فایل ورودی رسمی Client Instrumentation در Next.js است و قبل از Hydration
 * اجرا می‌شود. مقداردهی تم در اینجا، نیاز به رندر کردن <script> داخل درخت React
 * را از بین می‌برد و در عین حال از فلش تم روشن جلوگیری می‌کند.
 */
try {
  const stored = window.localStorage.getItem("theme");
  const followsSystem = !stored || stored === "system";
  const dark = stored === "dark" || (followsSystem && window.matchMedia("(prefers-color-scheme: dark)").matches);

  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
} catch {
  // localStorage ممکن است در حالت خصوصی یا سیاست‌های سخت‌گیرانه در دسترس نباشد.
}

export {};
