import { Metadata } from 'next';
import { getSiteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'خرید انواع تابلو نقاشی اورجینال و هنر دیواری مدرن',
  description:
    'فروشگاه آنلاین تابلو نقاشی، هنر دیواری، مجسمه، قاب و فریم، و هدایای هنری با بالاترین کیفیت، گواهی اصالت اثر و ارسال به سراسر کشور در گالری هنری آرتیسا.',
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'فروشگاه آثار هنری و تابلو نقاشی | آرتیسا',
    description:
      'مجموعه منتخب آثار هنرمندان برجسته ایرانی شامل تابلوهای رنگ روغن، آکریلیک، خط‌نقاشی و هنر مدرن.',
    url: `${getSiteUrl()}/products`,
    type: 'website',
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
