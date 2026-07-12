import { getPayloadClient } from '@/utilities/getPayload'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://muhandiss.uz'
  const payload = await getPayloadClient()

  const locales = ['uz', 'en'] as const

  const staticPages = [
    '', '/articles', '/glossary', '/hackathons', '/projects',
    '/mentors', '/team', '/about', '/contact', '/partners',
  ]

  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      })
    }
  }

  const { docs: articles } = await payload.find({
    collection: 'articles',
    limit: 500,
    select: { slug: true, updatedAt: true },
  })

  for (const article of articles) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/articles/${article.slug}`,
        lastModified: new Date(article.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  }

  const { docs: hackathons } = await payload.find({
    collection: 'hackathons',
    limit: 100,
    select: { slug: true, updatedAt: true },
  })

  for (const hack of hackathons) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/hackathons/${hack.slug}`,
        lastModified: new Date(hack.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  }

  const { docs: projects } = await payload.find({
    collection: 'student-projects',
    limit: 100,
    select: { slug: true, updatedAt: true },
  })

  for (const project of projects) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/projects/${project.slug}`,
        lastModified: new Date(project.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.5,
      })
    }
  }

  const { docs: mentors } = await payload.find({
    collection: 'mentors',
    limit: 100,
    select: { slug: true, updatedAt: true },
  })

  for (const mentor of mentors) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/mentors/${mentor.slug}`,
        lastModified: new Date(mentor.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.5,
      })
    }
  }

  return entries
}
