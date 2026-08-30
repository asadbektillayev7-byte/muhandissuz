import Link from 'next/link'
import { createPublicClient } from '@/lib/supabase/public'
import { field } from '@/lib/supabase/locale'
import { Gallery, GalleryImage } from '@/components/ui/shared-element-gallery'

/** Video rows render a poster plus play badge; images render themselves. */
function mediaProps(item: any, locale: string) {
  const isVideo = typeof item.mime_type === 'string' && item.mime_type.startsWith('video/')
  return {
    kind: (isVideo ? 'video' : 'image') as 'video' | 'image',
    // Only a real poster counts. thumbnail_url used to be set to the video's
    // own URL, which an <img> cannot decode — hence the grey fallback tiles.
    poster: isVideo ? item.poster_url || undefined : undefined,
    title: field(item, 'title', locale) || undefined,
  }
}

/** Newest media as a horizontal snapping row. */
export async function MediaStrip({ locale }: { locale: string }) {
  const supabase = createPublicClient()
  const { data: items } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6)

  if (!items?.length) return null

  const t =
    locale === 'uz'
      ? { title: 'Media', all: 'Barchasi', more: 'Barcha media' }
      : { title: 'Media', all: 'All', more: 'All media' }

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold">{t.title}</h2>
        <Link
          href={`/${locale}/media`}
          className="text-sm text-muted-foreground transition-colors duration-150 hover:text-accent"
        >
          {t.all} →
        </Link>
      </div>

      <Gallery>
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
          {items.map((item: any) => (
            <GalleryImage
              key={item.id}
              id={`strip-${item.id}`}
              src={item.url}
              alt={field(item, 'alt', locale) || field(item, 'title', locale)}
              {...mediaProps(item, locale)}
              // Fixed-height card. The inner <img> is sized via the child
              // selector because the component hardcodes w-full h-auto.
              className="!mb-0 h-64 shrink-0 snap-start [&_[data-gallery-media]]:h-64 [&_[data-gallery-media]]:w-auto [&_[data-gallery-media]]:max-w-none"
            />
          ))}

          <Link
            href={`/${locale}/media`}
            className="flex h-64 w-48 shrink-0 snap-start items-center justify-center border border-dashed text-sm text-muted-foreground transition-colors duration-150 hover:border-accent hover:text-accent"
            style={{ borderColor: 'var(--border)', borderRadius: 12 }}
          >
            {t.more} →
          </Link>
        </div>
      </Gallery>
    </section>
  )
}
