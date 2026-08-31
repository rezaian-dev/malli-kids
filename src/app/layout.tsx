import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";
import { StoreProvider } from "@/providers/store-provider";
import { ThemeProvider } from "@/providers/theme-provider";
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

// 🌍 Shared metadata for the whole app.
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
      className={`${vazir.variable} ${playfair.variable} [scrollbar-gutter:stable]`}
      suppressHydrationWarning
    >
      {/* 🪄 Keep Radix scroll-lock from shifting the RTL layout. */}
      <body
        className={`${vazir.className} min-h-dvh text-navy antialiased dark:text-ivory data-[scroll-locked]:mr-0!`}
        suppressHydrationWarning
      >
        {/* ✨ Top loader for route changes. */}
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
        {/* 🌗 Theme is applied before hydration. */}
        <ThemeProvider>
          <StoreProvider>
            {children}
            <Toaster />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
