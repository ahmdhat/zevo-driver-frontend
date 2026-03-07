import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

function getCookie(request: NextRequest, name: string) {
  return request.cookies.get(name)?.value ?? null;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Apply i18n routing first.
  const intlResponse = intlMiddleware(request);

  // Protect dashboard routes (client auth token mirrored in cookie).
  const isDashboardRoute = /^\/(en|ar)\/dashboard(\/|$)/.test(pathname);
  if (isDashboardRoute) {
    const token = getCookie(request, 'fleethub_driver_token');
    if (!token) {
      const url = request.nextUrl.clone();
      const locale = pathname.split('/')[1] || 'en';
      url.pathname = `/${locale}/explore`;
      return Response.redirect(url);
    }
  }

  return intlResponse;
}

export const config = {
  matcher: ['/', '/(en|ar)/:path*']
};
