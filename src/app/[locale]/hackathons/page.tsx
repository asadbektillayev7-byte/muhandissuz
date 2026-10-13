import { getHackathons, getHackathonPhotos } from '@/lib/supabase/queries'
import { hackathonCard, type GalleryPhoto, type ShowcaseItem } from '@/lib/showcase'
import { getShowcaseLabels } from '@/lib/showcase-i18n'
import { ShowcaseCards } from '@/components/ShowcaseCards'

export const revalidate = 600

export default async function HackathonsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const label = getShowcaseLabels(locale)
  let items: ShowcaseItem[] = []
  let failed = false
  let galleryFailed = false
  try {
    const hackathons = await getHackathons(locale)
    let photos: Record<string, GalleryPhoto[]> = {}
    try {
      photos = await getHackathonPhotos(hackathons.map((hack) => hack.id))
    } catch (error) {
      console.error(error)
      galleryFailed = true
    }
    items = hackathons.map((hack) => hackathonCard(hack, locale, photos[String(hack.id)]))
  } catch (error) {
    console.error(error)
    failed = true
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">{label.titleHackathons}</h1>
      <p className="text-muted-foreground mb-8">{label.subtitleHackathons}</p>
      {galleryFailed && <p role="alert" className="mb-6 text-sm text-muted-foreground">{label.galleryLoadError}</p>}
      {failed ? <p role="alert" className="text-muted-foreground">{label.loadError}</p>
        : items.length === 0 ? <p className="text-muted-foreground">{label.emptyHackathons}</p>
        : <ShowcaseCards items={items} locale={locale} />}
    </div>
  )
}
