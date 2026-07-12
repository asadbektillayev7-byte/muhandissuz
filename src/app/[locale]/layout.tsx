import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const meta = locale === 'uz' ? {
    title: 'Muhandis.uz - Muhandislik va texnologiyalar haqida',
    description: 'Muhandislik maqolalari, hackathonlar va talabalar loyihalari portali',
  } : {
    title: 'Muhandis.uz - Engineering & Technology',
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
      siteName: 'Muhandis.uz',
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
    <html lang={locale}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
