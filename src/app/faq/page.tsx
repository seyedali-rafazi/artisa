import type { Metadata } from 'next';
import FaqView from '@/components/views/FaqView';

export const metadata: Metadata = {
  title: 'سوالات متداول | گالری آنلاین آرتیسا',
  description: 'پاسخ به سوالات متداول کاربران درباره خرید آنلاین آثار هنری، اصالت تابلوها، بسته‌بندی ایمن، ارسال به سراسر کشور و شرایط ضمانت بازگشت وجه در آرتیسا.',
  openGraph: {
    title: 'سوالات متداول | گالری آنلاین آرتیسا',
    description: 'پاسخ به سوالات متداول درباره خرید آنلاین آثار هنری، گواهی اصالت، ارسال و ضمانت بازگشت.',
    type: 'website',
  },
};

export default function FaqPage() {
  return <FaqView />;
}
