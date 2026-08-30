import { Header } from '@/components/Header'
import { MinimalFooter } from '@/components/MinimalFooter'
import { BottomNav } from '@/components/BottomNav'
import type { Metadata } from 'next'
import { switzer } from '../fonts'
import { NIGHT_END_HOUR, NIGHT_START_HOUR } from '@/lib/theme'

/**
 * Without this, every page under [locale] has an unknown param at build time,
 * so nothing can be prerendered and each navigation pays a full server render.
 * The site has exactly two locales, so both are enumerated.
 */
export function generateStaticParams() {
  return [{ locale: 'uz' }, { locale: 'en' }]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const meta = locale === 'uz' ? {
    title: 'Muhandiss.uz - Muhandislik va texnologiyalar haqida',
    description: 'Muhandislik maqolalari, hackathonlar va talabalar loyihalari portali',
  } : {
    title: 'Muhandiss.uz - Engineering & Technology',
    description: 'Engineering articles, hackathons and student projects portal',
  }

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://muhandiss.uz'

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: baseUrl,
      siteName: 'Muhandiss.uz',
      locale: locale === 'uz' ? 'uz_UZ' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        uz: `${baseUrl}/uz`,
        en: `${baseUrl}/en`,
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    // suppressHydrationWarning: the theme script below adds `dark` to this
    // element before hydration, so its class list intentionally differs from
    // what the server rendered.
    <html lang={locale} className={switzer.variable} suppressHydrationWarning>
      <head>
        {/*
          Applies the theme class before first paint. Without this the class
          only lands in ThemeToggle's effect, after hydration, so every load
          renders light first and then flips — a long, obvious flash on a slow
          machine. Kept in sync with src/lib/theme.ts by hand; it must stay
          dependency-free to run this early.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var h=new Date().getHours();var d=s==='dark'||s==='light'?s==='dark':(h>=${NIGHT_START_HOUR}||h<${NIGHT_END_HOUR});document.documentElement.classList.toggle('dark',d)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col pb-20">
        <Header />
        <main className="flex-1">{children}</main>
        <MinimalFooter />
        <BottomNav />
      </body>
    </html>
  )
}
