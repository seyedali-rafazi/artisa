import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";
import { AppProvider } from "@/components/AppContext";
import AppShell from "@/components/layout/AppShell";
import QueryProvider from "@/components/providers/QueryProvider";

const vazirmatn = localFont({
  src: [
    {
      path: "../../public/fonts/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Vazirmatn-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Vazirmatn-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Vazirmatn-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Vazirmatn-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "آرتیسا | گالری آنلاین تابلو و هنر دیواری",
  description: "خرید آنلاین تابلو نقاشی اورجینال، هنر دیواری، مجسمه و اکسسوری‌های هنری از هنرمندان ایرانی با گواهی اصالت و ارسال مطمئن به سراسر کشور.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`h-full antialiased ${vazirmatn.variable}`}>
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>
          <LanguageProvider>
            <AppProvider>
              <AppShell>{children}</AppShell>
            </AppProvider>
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
