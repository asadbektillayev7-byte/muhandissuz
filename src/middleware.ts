import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const locales = ['uz', 'en']
const defaultLocale = 'uz'

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes are not localised, but their auth cookies need refreshing.
  if (pathname.startsWith('/admin')) {
    // Send /admin to the dashboard here rather than from a Server Component.
    // A component whose only job is to throw NEXT_REDIRECT breaks React's dev
    // performance tracks ("cannot have a negative time stamp"), which kills the
    // client-side navigation after login.
    if (pathname === '/admin' || pathname === '/admin/') {
      return NextResponse.redirect(new URL('/admin/articles', request.url))
    }
    return updateSession(request)
  }

  // Anything with a file extension is a static asset in /public — never a
  // localised page. Matching on the extension covers new folders (videos,
  // fonts, ...) without having to extend this list every time.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
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
