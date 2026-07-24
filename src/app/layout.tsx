import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";
import { AppProvider } from "@/components/AppContext";
import AppShell from "@/components/layout/AppShell";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["100", "200", "300", "400", "500", "700", "800", "900"],
  variable: "--font-vazirmatn",
  display: "swap",
  fallback: ["Tahoma", "sans-serif"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "آرتیسا | گالری آنلاین تابلو و هنر دیواری",
  description: "خرید آنلاین تابلو نقاشی اورجینال، هنر دیواری، مجسمه و اکسسوری‌های هنری از هنرمندان ایرانی با گواهی اصالت و ارسال مطمئن به سراسر کشور.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`h-full antialiased ${vazirmatn.variable}`}>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <AppProvider>
            <AppShell>{children}</AppShell>
          </AppProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
