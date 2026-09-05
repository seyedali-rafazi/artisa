import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'پنل مدیریت آرتیسا',
    template: '%s | مدیریت آرتیسا',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
