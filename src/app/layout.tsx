import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";
import { Store } from "@/lib/store";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const vazir = localFont({
  src: [
    { path: "../fonts/Vazirmatn-Regular.woff2", weight: "400" },
    { path: "../fonts/Vazirmatn-Medium.woff2", weight: "500" },
    { path: "../fonts/Vazirmatn-SemiBold.woff2", weight: "600" },
    { path: "../fonts/Vazirmatn-Bold.woff2", weight: "700" },
    { path: "../fonts/Vazirmatn-ExtraBold.woff2", weight: "800" },
    { path: "../fonts/Vazirmatn-Black.woff2", weight: "900" },
  ],
  variable: "--font-vazir",
  display: "swap",
});

const playfair = localFont({
  src: [
    { path: "../fonts/PlayfairDisplay-Regular.woff2", weight: "400" },
    { path: "../fonts/PlayfairDisplay-Bold.woff2", weight: "700" },
  ],
  variable: "--font-display",
  display: "swap",
});

// Site-wide metadata defaults. The favicon / touch icons are picked up
// automatically by Next from app/favicon.ico, app/icon.png and app/apple-icon.png
// (generated from the brand favicon.jpg). Child pages can override title via the template.
export const metadata: Metadata = {
  title: { default: "مالی کیدز | پوشاک کودک", template: "%s | مالی کیدز" },
  description: "فروشگاه اینترنتی پوشاک کودک مالی کیدز — از نوزادی تا ۱۰ سالگی.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fa"
      dir="rtl"
      data-scroll-behavior="smooth"
      className={`${vazir.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      {/*
        `data-[scroll-locked]:mr-0!` — پچِ جابه‌جایی صفحه:
        قفلِ اسکرولِ رادیکس (react-remove-scroll-bar) روی body این را می‌نویسد:
            body[data-scroll-locked]{ …margin-right: ۱۵px !important }
        آن ۱۵px جبرانیِ عرضِ اسکرول‌بارِ Viewport است، ولی در این پروژه اسکرول‌بار
        هرگز حذف نمی‌شود (قفل روی body است و اسکرول‌کنندهٔ واقعی، viewport با
        html{overflow-x:hidden}) و در RTL هم margin-right سمتِ اشتباهی است
        → پس کل صفحه چند پیکسل «می‌پرد». این کلاسِ Tailwind با ویژگیِ بالاتر
        (کلاس + صفت، به‌همراه !important) همان مقدار را صفر می‌کند؛
        یعنی هیچ CSS دست‌نویسی لازم نشده است.
      */}
      <body
        className={`${vazir.className} min-h-dvh text-navy antialiased dark:text-ivory data-[scroll-locked]:mr-0!`}
        suppressHydrationWarning
      >
        {/* نوارِ پیشرفتِ طلاییِ بالای صفحه هنگامِ جابه‌جایی بین صفحات */}
        <NextTopLoader
          color="#d9b77f"
          height={3}
          showSpinner={false}
          speed={240}
          crawlSpeed={110}
          easing="cubic-bezier(0.4, 0, 0.2, 1)"
          shadow="0 0 14px rgba(217,183,127,.85), 0 0 6px rgba(193,147,87,.9)"
          zIndex={9999}
        />
        {/* تم اولیه در instrumentation-client و پیش از Hydration اعمال می‌شود؛
            بنابراین هیچ تگ script داخل درخت React رندر نمی‌شود. */}
        <ThemeProvider>
          <Store>
            {children}
            <Toaster />
          </Store>
        </ThemeProvider>
      </body>
    </html>
  );
}
