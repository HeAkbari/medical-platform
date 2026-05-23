import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { AppProviders } from '@/lib/providers';
import { LOCALES, type Locale } from '@/lib/env';

export const metadata: Metadata = {
  title: 'Medical Platform',
  description: 'Medical platform clinic MVP',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!LOCALES.includes(locale as Locale)) {
    notFound();
  }

  const dir = locale === 'fa' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
