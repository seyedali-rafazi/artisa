import type { Metadata } from "next";
import AboutUsView from "@/components/views/AboutUsView";
import { getSiteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "درباره ما | معرفی گالری آنلاین آثار هنری",
  description:
    "آشنایی با تاریخچه، اهداف و ماموریت گالری آنلاین آرتیسا؛ پل ارتباطی میان هنرمندان معاصر ایرانی و علاقه‌مندان به هنر اصیل در سراسر کشور با گواهی اصالت.",
  alternates: {
    canonical: "/about-us",
  },
  openGraph: {
    title: "درباره گالری آنلاین آرتیسا",
    description:
      "آرتیسا مرجع تخصصی خرید آنلاین تابلو نقاشی اورجینال، هنر دیواری و دکوراسیون هنری از برترین هنرمندان ایرانی.",
    url: `${getSiteUrl()}/about-us`,
    type: "website",
  },
};

export default function AboutUsPage() {
  return <AboutUsView />;
}
