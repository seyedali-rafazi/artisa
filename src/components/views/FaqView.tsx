'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../LanguageContext';
import { ChevronDown, HelpCircle, MessageCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { useFAQs, FAQItem } from '@/hooks/useFaqs';
import { Button } from '@/components/ui/button';

export default function FaqView() {
  const { t } = useLanguage();
  const { data: apiFaqs, isLoading, isError, refetch } = useFAQs();
  const [openIndexes, setOpenIndexes] = useState<Record<number, boolean>>({});

  const faqs = apiFaqs || [];

  const toggleAccordion = (idx: number) => {
    setOpenIndexes((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Structured Data (JSON-LD) for Search Engine Rich Snippets
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question || faq.q || '',
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer || faq.a || '',
      },
    })),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12" dir="rtl">
      {/* Schema.org JSON-LD injection */}
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* ─── Hero Header ─── */}
      <div className="text-center mb-10 md:mb-12">
        <div className="inline-flex items-center justify-center size-12 rounded-3xl bg-primary/10 text-primary mb-4 shadow-sm">
          <HelpCircle className="size-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-foreground mb-3 tracking-tight">
          {t('faqTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          {t('faqSubtitle')}
        </p>
      </div>

      {/* ─── Content States ─── */}
      {isLoading ? (
        /* Loading Skeleton */
        <div className="flex flex-col gap-3.5" aria-busy="true" aria-label="در حال بارگذاری سوالات متداول">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse border border-border/30"
            />
          ))}
        </div>
      ) : isError ? (
        /* Error State */
        <div className="text-center py-16 px-6 rounded-3xl border border-destructive/20 bg-destructive/5 flex flex-col items-center gap-4">
          <div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertCircle className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-black text-foreground">
              خطا در برقراری ارتباط با سرور
            </span>
            <span className="text-xs text-muted-foreground">
              متأسفانه در دریافت سوالات متداول مشکلی پیش آمده است. لطفاً مجدداً تلاش کنید.
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="rounded-2xl text-xs font-bold gap-2 mt-2 cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>تلاش مجدد</span>
          </Button>
        </div>
      ) : faqs.length > 0 ? (
        /* Accordion List */
        <div className="flex flex-col gap-3.5" role="presentation">
          {faqs.map((faq, idx) => {
            const isOpen = Boolean(openIndexes[idx]);
            const headerId = `faq-header-${faq.id || idx}`;
            const panelId = `faq-panel-${faq.id || idx}`;
            const questionText = faq.question || faq.q;
            const answerText = faq.answer || faq.a;

            return (
              <article
                key={faq.id || idx}
                className={`border rounded-2xl transition-all duration-200 overflow-hidden bg-background/95 backdrop-blur-sm shadow-xs ${
                  isOpen
                    ? 'border-primary/40 shadow-md ring-1 ring-primary/20'
                    : 'border-border/60 hover:border-border hover:shadow-sm'
                }`}
              >
                <h3>
                  <button
                    type="button"
                    id={headerId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleAccordion(idx)}
                    className="w-full p-5 flex items-center justify-between text-start gap-4 font-extrabold text-xs sm:text-sm text-foreground hover:bg-muted/10 transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                  >
                    <span className="flex-1 leading-snug">{questionText}</span>
                    <div
                      className={`size-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isOpen ? 'bg-primary/10 text-primary' : 'bg-muted/40 text-muted-foreground'
                      }`}
                    >
                      <ChevronDown
                        className={`size-4 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-primary' : ''
                        }`}
                      />
                    </div>
                  </button>
                </h3>

                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={headerId}
                    className="px-5 pb-5 pt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/20 bg-muted/5 animate-in fade-in slide-in-from-top-1 duration-200 whitespace-pre-line font-medium"
                  >
                    {answerText}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 px-6 rounded-3xl border border-dashed border-border/80 bg-background/50 flex flex-col items-center justify-center gap-3">
          <div className="size-14 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center">
            <HelpCircle className="size-7" />
          </div>
          <span className="text-sm font-black text-foreground">
            پرسش و پاسخی ثبت نشده است
          </span>
          <span className="text-xs text-muted-foreground max-w-xs">
            در حال حاضر سوالات متداولی برای نمایش وجود ندارد. به زودی به این بخش افزوده خواهد شد.
          </span>
        </div>
      )}

      {/* ─── Bottom Support Banner ─── */}
      <div className="mt-14 p-6 sm:p-8 rounded-3xl border border-border/60 bg-muted/20 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-start shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <MessageCircle className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-sm sm:text-base font-black text-foreground">
              پاسخ سوال خود را پیدا نکردید؟
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              کارشناسان پشتیبانی آرتیسا در کلیه روزهای هفته آماده راهنمایی و پاسخگویی به شما هستند.
            </p>
          </div>
        </div>

        <Link href="/contact-us" className="shrink-0 w-full sm:w-auto">
          <Button className="rounded-2xl font-extrabold text-xs px-5 h-11 w-full sm:w-auto cursor-pointer shadow-md shadow-primary/20">
            تماس با پشتیبانی
          </Button>
        </Link>
      </div>
    </div>
  );
}
