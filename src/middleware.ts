import { NextRequest, NextResponse } from 'next/server'
import { locales, isValidLocale } from '@/i18n/config'
import { detectLocale } from '@/i18n/detectLocale'

const COOKIE_NAME = 'NEXT_LOCALE'
const COOKIE_MAX_AGE = 31536000

export function middleware(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl

  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (pathnameLocale) {
    return NextResponse.next()
  }

  const cookieLocale = request.cookies.get(COOKIE_NAME)?.value
  const locale =
    cookieLocale && isValidLocale(cookieLocale)
      ? cookieLocale
      : detectLocale(request.headers.get('accept-language'))

  const redirectUrl = new URL(`/${locale}${pathname}${search}`, request.url)
  const response = NextResponse.redirect(redirectUrl, 302)

  response.cookies.set(COOKIE_NAME, locale, {
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
  })

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|admin|next).*)'],
}
