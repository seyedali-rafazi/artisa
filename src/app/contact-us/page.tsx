import type { Metadata } from "next";
import { ContactUsView } from "@/components/views/StaticPages";
import { getSiteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "تماس با ما | مشاوره تخصصی خرید آثار هنری و تابلو",
  description:
    "راه‌های ارتباط با کارشناسان هنری گالری آرتیسا؛ تلفن پشتیبانی، ایمیل، مشاوره انتخاب تابلو متناسب با دکوراسیون و ثبت سفارش‌های اختصاصی نقاشی.",
  alternates: {
    canonical: "/contact-us",
  },
  openGraph: {
    title: "تماس با ما | گالری آنلاین آرتیسا",
    description:
      "شماره تماس، ایمیل و راه‌های ارتباطی با پشتیبانی و مشاوران هنری گالری آنلاین آرتیسا.",
    url: `${getSiteUrl()}/contact-us`,
    type: "website",
  },
};

export default function ContactUsPage() {
  return <ContactUsView />;
}
