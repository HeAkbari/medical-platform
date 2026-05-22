import type { Metadata } from 'next';
import { AppProviders } from '@/providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Medical Platform',
  description: 'Medical platform frontend MVP with mock backend APIs',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
