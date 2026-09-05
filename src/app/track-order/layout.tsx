import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'پیگیری سفارش',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TrackOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
