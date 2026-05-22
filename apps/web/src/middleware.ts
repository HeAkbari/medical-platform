import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEFAULT_LOCALE, LOCALES } from '@/lib/env';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale && pathname !== '/') {
    return NextResponse.redirect(
      new URL(`/${DEFAULT_LOCALE}${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
