import { getMedia } from '@/lib/supabase/queries'
import { field } from '@/lib/supabase/locale'
import Image from 'next/image'

export default async function MediaPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const mediaItems = await getMedia(locale)

  const content = locale === 'uz' ? {
    title: 'Media',
    subtitle: 'Rasmlar va videolar galereyasi',
    noMedia: 'Hozircha media mavjud emas.',
  } : {
    title: 'Media',
    subtitle: 'Photo and video gallery',
    noMedia: 'No media available yet.',
  }

  if (mediaItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">{content.title}</h1>
        <p className="text-muted-foreground mb-8">{content.subtitle}</p>
        <p className="text-muted-foreground">{content.noMedia}</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">{content.title}</h1>
      <p className="text-muted-foreground mb-8">{content.subtitle}</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mediaItems.map((item: any) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-secondary"
          >
            {item.mime_type?.startsWith('video') ? (
              <video
                src={item.url}
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={item.thumbnail_url || item.url}
                alt={field(item, 'alt', locale)}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}
            {field(item, 'alt', locale) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs truncate">{field(item, 'alt', locale)}</p>
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  )
}
