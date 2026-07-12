import type { Metadata } from 'next'

type SEOArgs = {
  title: string
  description: string
  locale: string
  path: string
  image?: string
}

export function generateMetadata({ title, description, locale, path, image }: SEOArgs): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://muhandiss.uz'
  const url = `${baseUrl}/${locale}${path}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: image ? [{ url: image }] : undefined,
      locale: locale === 'uz' ? 'uz_UZ' : 'en_US',
      siteName: 'Muhandis.uz',
    },
    alternates: {
      canonical: url,
      languages: {
        uz: `${baseUrl}/uz${path}`,
        en: `${baseUrl}/en${path}`,
      },
    },
  }
}
