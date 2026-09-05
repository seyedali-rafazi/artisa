"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary triggered:", error);
  }, [error]);

  return (
    <div
      dir="rtl"
      className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center"
    >
      <div className="size-16 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center mb-6 shadow-sm">
        <AlertTriangle className="size-8" />
      </div>

      <h1 className="text-xl sm:text-2xl font-black text-foreground mb-3">
        خطایی در بارگذاری صفحه رخ داد
      </h1>

      <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-8 leading-relaxed font-semibold">
        متأسفانه در پردازش این بخش خطایی به وجود آمده است. لطفاً صفحه را مجدداً بارگذاری
        کنید یا به صفحه اصلی بازگردید.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => reset()}
          size="lg"
          className="rounded-2xl font-bold text-xs gap-2 cursor-pointer shadow-md shadow-primary/20"
        >
          <RotateCcw className="size-4" />
          <span>تلاش مجدد</span>
        </Button>

        <Link href="/">
          <Button
            variant="outline"
            size="lg"
            className="rounded-2xl font-bold text-xs gap-2 cursor-pointer"
          >
            <Home className="size-4" />
            <span>بازگشت به صفحه اصلی</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
