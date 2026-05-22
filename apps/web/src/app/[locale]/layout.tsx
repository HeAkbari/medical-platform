import { notFound } from 'next/navigation';
import { AppProviders } from '@/lib/providers';
import { LOCALES, type Locale } from '@/lib/env';

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
