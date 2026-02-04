import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hanamindcare Supervision',
  description: 'AI-Powered Supervision Report Generation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
