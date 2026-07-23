import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://muhandiss.uz'
  const supabase = await createClient()

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

  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .limit(500)

  if (articles) {
    for (const article of articles) {
      for (const locale of locales) {
        entries.push({
          url: `${baseUrl}/${locale}/articles/${article.slug}`,
          lastModified: new Date(article.updated_at),
          changeFrequency: 'monthly',
          priority: 0.6,
        })
      }
    }
  }

  const { data: hackathons } = await supabase
    .from('hackathons')
    .select('slug, updated_at')
    .limit(100)

  if (hackathons) {
    for (const hack of hackathons) {
      for (const locale of locales) {
        entries.push({
          url: `${baseUrl}/${locale}/hackathons/${hack.slug}`,
          lastModified: new Date(hack.updated_at),
          changeFrequency: 'monthly',
          priority: 0.6,
        })
      }
    }
  }

  const { data: projects } = await supabase
    .from('student_projects')
    .select('slug, updated_at')
    .limit(100)

  if (projects) {
    for (const project of projects) {
      for (const locale of locales) {
        entries.push({
          url: `${baseUrl}/${locale}/projects/${project.slug}`,
          lastModified: new Date(project.updated_at),
          changeFrequency: 'monthly',
          priority: 0.5,
        })
      }
    }
  }

  const { data: mentors } = await supabase
    .from('mentors')
    .select('slug, updated_at')
    .limit(100)

  if (mentors) {
    for (const mentor of mentors) {
      for (const locale of locales) {
        entries.push({
          url: `${baseUrl}/${locale}/mentors/${mentor.slug}`,
          lastModified: new Date(mentor.updated_at),
          changeFrequency: 'monthly',
          priority: 0.5,
        })
      }
    }
  }

  return entries
}
