import type { Metadata } from 'next';
import FaqView from '@/components/views/FaqView';
import { FAQItem } from '@/hooks/useFaqs';
import { getSiteUrl, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'سوالات متداول | پاسخ به پرسش‌های خرید تابلو و آثار هنری',
  description:
    'پاسخ به تمامی سوالات متداول درباره خرید آنلاین آثار هنری، نحوه صدور گواهی اصالت، روش‌های بسته‌بندی ضدضربه، ارسال به سراسر کشور و شرایط ضمانت بازگشت در آرتیسا.',
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'سوالات متداول | گالری آنلاین آرتیسا',
    description:
      'پاسخ به سوالات متداول درباره خرید آنلاین آثار هنری، گواهی اصالت، ارسال و ضمانت بازگشت.',
    url: `${getSiteUrl()}/faq`,
    type: 'website',
  },
};

async function getFaqs(): Promise<FAQItem[]> {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://artisa-backend.vercel.app';
  try {
    const res = await fetch(`${backendUrl}/api/v1/faqs`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.items || data?.data || (Array.isArray(data) ? data : [])) as FAQItem[];
  } catch {
    return [];
  }
}

export default async function FaqPage() {
  const faqs = await getFaqs();
  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'خانه', url: '/' },
    { name: 'سوالات متداول', url: '/faq' },
  ]);

  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <FaqView initialData={faqs} />
    </>
  );
}
