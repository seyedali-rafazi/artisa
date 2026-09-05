import Link from "next/link";
import type { Metadata } from "next";
import { Compass, Home, ShoppingBag, BookOpen, Phone, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "صفحه مورد نظر یافت نشد (خطای ۴۰۴)",
  description: "متاسفانه صفحه‌ای که به دنبال آن بودید یافت نشد یا ممکن است آدرس آن تغییر کرده باشد.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div
      dir="rtl"
      className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 text-center"
    >
      {/* Decorative Badge */}
      <div className="size-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-sm">
        <Compass className="size-10 animate-pulse" />
      </div>

      <span className="text-5xl md:text-7xl font-black text-primary/30 tracking-widest mb-2 font-mono">
        ۴۰۴
      </span>

      <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground mb-3 tracking-tight">
        صفحه مورد نظر یافت نشد!
      </h1>

      <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-8 leading-relaxed font-semibold">
        ممکن است آدرس وارد شده نادرست باشد، یا صفحه مورد نظرتان حذف یا جابجا شده باشد.
        می‌توانید از طریق لینک‌های زیر به بخش‌های مختلف گالری دسترسی داشته باشید:
      </p>

      {/* Primary Action */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        <Link href="/">
          <Button size="lg" className="rounded-2xl font-bold text-xs gap-2 cursor-pointer shadow-md shadow-primary/20">
            <Home className="size-4" />
            <span>بازگشت به صفحه اصلی</span>
          </Button>
        </Link>
        <Link href="/products">
          <Button variant="outline" size="lg" className="rounded-2xl font-bold text-xs gap-2 cursor-pointer">
            <ShoppingBag className="size-4" />
            <span>مشاهده همه محصولات</span>
          </Button>
        </Link>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl text-start">
        <Link
          href="/blog"
          className="p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/50 transition-all group flex items-center gap-3"
        >
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BookOpen className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
              مجله هنر آرتیسا
            </span>
            <span className="text-[10px] text-muted-foreground">جدیدترین مقالات و راهنماها</span>
          </div>
        </Link>

        <Link
          href="/faq"
          className="p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/50 transition-all group flex items-center gap-3"
        >
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <HelpCircle className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
              سوالات متداول
            </span>
            <span className="text-[10px] text-muted-foreground">پاسخ به پرسش‌های رایج</span>
          </div>
        </Link>

        <Link
          href="/contact-us"
          className="p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/50 transition-all group flex items-center gap-3"
        >
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Phone className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
              تماس با پشتیبانی
            </span>
            <span className="text-[10px] text-muted-foreground">مشاوره انتخاب و خرید اثر</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
