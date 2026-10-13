import { field } from './supabase/locale'
import { parseVideoUrl } from './video'

export type GalleryPhoto = {
  id: string | number
  url: string
  caption?: string | null
  position: number
}

export type ShowcaseItem = {
  id: string | number
  title: string
  href: string
  date: string | null
  endDate?: string | null
  status?: string | null
  summary?: string | null
  posterUrl: string | null
  videoUrl: string | null
  photos?: GalleryPhoto[]
}

/** Legacy JSON text must not crash a whole public list. */
export function readArray(value: unknown): unknown[] {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function hackathonCard(row: Record<string, any>, locale: string, photos: GalleryPhoto[] = []): ShowcaseItem {
  const legacyVideo = parseVideoUrl(row.cover_image_url)
  return {
    id: row.id,
    title: field(row, 'title', locale),
    href: `/${locale}/hackathons/${row.slug}`,
    date: row.date_range_start || row.created_at || null,
    endDate: row.date_range_end || null,
    status: row.status || null,
    summary: field(row, 'summary', locale),
    posterUrl: legacyVideo ? null : row.cover_image_url || null,
    videoUrl: row.video_url || (legacyVideo ? row.cover_image_url : null),
    photos,
  }
}

export function projectCard(row: Record<string, any>, locale: string): ShowcaseItem {
  const images = readArray(row.images)
  const firstImage = images.find((image: any) => typeof image?.url === 'string') as { url: string } | undefined
  const names = readArray(row.student_names).filter((name): name is string => typeof name === 'string')
  return {
    id: row.id,
    title: field(row, 'title', locale),
    href: `/${locale}/projects/${row.slug}`,
    date: row.date_range_start || row.created_at || null,
    status: row.status || null,
    summary: names.join(', ') || row.age_group || null,
    posterUrl: row.cover_image_url || firstImage?.url || null,
    videoUrl: row.video_url || null,
  }
}
