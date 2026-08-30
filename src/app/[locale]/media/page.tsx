import { createPublicClient } from '@/lib/supabase/public'
import { field } from '@/lib/supabase/locale'
import { Gallery, GalleryGrid, GalleryImage } from '@/components/ui/shared-element-gallery'

// Public content: served from cache and rebuilt in the background, so a
// navigation does not wait on a server render plus a database round-trip.
// Next only accepts a literal here, so the shared PUBLIC_REVALIDATE in
// lib/supabase/public.ts documents the value rather than supplying it.
export const revalidate = 600

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

export default async function MediaPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = createPublicClient()

  const { data: mediaItems } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const items = mediaItems || []

  const content =
    locale === 'uz'
      ? {
          title: 'Media',
          subtitle: 'Tadbirlar va loyihalar galereyasi',
          noMedia: 'Hozircha media mavjud emas.',
        }
      : {
          title: 'Media',
          subtitle: 'Events and projects gallery',
          noMedia: 'No media available yet.',
        }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-10">
        <h1 className="font-display text-4xl font-bold mb-2">{content.title}</h1>
        <p className="text-muted-foreground">{content.subtitle}</p>
      </header>

      {items.length === 0 ? (
        <p className="text-muted-foreground">{content.noMedia}</p>
      ) : (
        <Gallery>
          <GalleryGrid>
            {items.map((item: any) => (
              <GalleryImage
                key={item.id}
                id={String(item.id)}
                src={item.url}
                alt={field(item, 'alt', locale) || field(item, 'title', locale)}
                {...mediaProps(item, locale)}
              />
            ))}
          </GalleryGrid>
        </Gallery>
      )}
    </div>
  )
}
