import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { field } from '@/lib/supabase/locale'

export default async function MediaDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const supabase = await createClient()
  const { data: item } = await supabase.from('media').select('*').eq('id', id).single()

  if (!item) notFound()

  const title = field(item, 'title', locale) || field(item, 'alt', locale)
  const location = field(item, 'location', locale)
  const description = field(item, 'description', locale)

  const isVideo = item.mime_type?.startsWith('video')
  const dateStr = item.event_date
    ? new Date(item.event_date).toLocaleDateString(locale === 'uz' ? 'uz-UZ' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href={`/${locale}/media`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        {locale === 'uz' ? 'Media galereyasi' : 'Media gallery'}
      </Link>

      <article>
        {title && <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>}

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
          {dateStr && <span>{dateStr}</span>}
          {location && <span>{location}</span>}
        </div>

        <div className="rounded-lg overflow-hidden border border-border bg-secondary mb-8">
          {isVideo ? (
            <video
              src={item.url}
              controls
              poster={item.poster_url || item.thumbnail_url || undefined}
              className="w-full max-h-[70vh] object-contain bg-black"
            />
          ) : (
            <img
              src={item.url}
              alt={field(item, 'alt', locale)}
              className="w-full max-h-[70vh] object-contain bg-black"
            />
          )}
        </div>

        {description && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p>{description}</p>
          </div>
        )}
      </article>
    </div>
  )
}
