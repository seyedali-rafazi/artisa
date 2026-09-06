import type { Metadata } from 'next';
import TermsView from '@/components/views/TermsView';
import { getSiteUrl, generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'شرایط و قوانین | قوانین خرید، ارسال و ضمانت اصالت آثار',
  description:
    'مطالعه شرایط و قوانین رسمی گالری آنلاین آرتیسا؛ شامل ضوابط خرید آنلاین تابلو نقاشی اورجینال، صدور گواهی اصالت هولوگرام‌دار، بسته‌بندی ۵ لایه ضدضربه و رویه ضمانت بازگشت ۷ روزه کالا.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'شرایط و قوانین خرید از گالری آنلاین آرتیسا',
    description:
      'قوانین و مقررات رسمی خرید، ضمانت اصالت آثار هنری، روش‌های ارسال تخصصی و رویه بازگرداندن ۷ روزه کالا در آرتیسا.',
    url: `${getSiteUrl()}/terms`,
    type: 'website',
  },
};

export default function TermsPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'خانه', url: '/' },
    { name: 'شرایط و قوانین', url: '/terms' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <TermsView />
    </>
  );
}
