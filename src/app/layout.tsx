import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import { Store } from "@/lib/store";
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
    <html lang="fa" dir="rtl" className={`${vazir.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className={`${vazir.className} min-h-dvh text-navy antialiased dark:text-ivory`} suppressHydrationWarning>
        <Store>
          {children}
          <Toaster />
        </Store>
      </body>
    </html>
  );
}
