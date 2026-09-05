import { Suspense } from "react";
import type { Metadata } from "next";
import HomeView from "@/components/home/HomeView";

export const metadata: Metadata = {
  title: "آرتیسا | گالری آنلاین تابلو نقاشی و هنر دیواری اورجینال",
  description:
    "خرید آنلاین تابلو نقاشی اورجینال، هنر دیواری مدرن، مجسمه و اکسسوری‌های هنری از هنرمندان معاصر ایرانی با گواهی اصالت و ارسال مطمئن به سراسر کشور.",
  alternates: {
    canonical: "/",
  },
};

export default function RootPage() {
  return (
    <>
      {/* Semantic H1 for Google Search & Accessibility (visually hidden for pristine luxury UI design) */}
      <h1 className="sr-only">
        گالری آنلاین آثار هنری، تابلو نقاشی اورجینال و هنر دیواری آرتیسا
      </h1>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-muted/30" />}>
        <HomeView />
      </Suspense>
    </>
  );
}
