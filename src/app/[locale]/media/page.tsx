import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { field } from '@/lib/supabase/locale'
import { MediaGridClient } from './MediaGridClient'
import { ArrowLeft, Calendar, MapPin } from 'lucide-react'

export default async function MediaPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: mediaItems } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const items = mediaItems || []

  const content = locale === 'uz' ? {
    title: 'Media',
    subtitle: 'Tadbirlar va loyihalar galereyasi',
    noMedia: 'Hozircha media mavjud emas.',
    back: 'Bosh sahifa',
  } : {
    title: 'Media',
    subtitle: 'Events and projects gallery',
    noMedia: 'No media available yet.',
    back: 'Home',
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">{content.title}</h1>
        <p className="text-muted-foreground mb-8">{content.subtitle}</p>
        <p className="text-muted-foreground">{content.noMedia}</p>
      </div>
    )
  }

  const tiles = items.map((item: any) => {
    const title = field(item, 'title', locale) || field(item, 'alt', locale)
    const location = field(item, 'location', locale)
    const dateStr = item.event_date
      ? new Date(item.event_date).toLocaleDateString(locale === 'uz' ? 'uz-UZ' : 'en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : null
    const isVideo = item.mime_type?.startsWith('video')
    const imgUrl = isVideo
      ? (item.poster_url || item.thumbnail_url || item.url)
      : (item.thumbnail_url || item.url)

    return {
      id: item.id,
      imgUrl,
      title,
      location,
      dateStr,
      isVideo,
      locale,
      slug: item.slug || item.id,
      alt: field(item, 'alt', locale) || title,
    }
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">{content.title}</h1>
      <p className="text-muted-foreground mb-8">{content.subtitle}</p>

      <MediaGridClient tiles={tiles} locale={locale} />
    </div>
  )
}
