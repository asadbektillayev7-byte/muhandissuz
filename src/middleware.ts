import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['uz', 'en']
const defaultLocale = 'uz'

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname === '/favicon.ico' || pathname.startsWith('/logo/') || pathname.startsWith('/images/')) {
    return
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  const url = new URL(`/${defaultLocale}${pathname}`, request.url)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo/|images/).*)'],
}
