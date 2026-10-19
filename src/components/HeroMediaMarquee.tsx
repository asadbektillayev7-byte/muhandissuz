import { createPublicClient } from '@/lib/supabase/public'
import { HeroMediaMarqueeClient } from './HeroMediaMarqueeClient'

/** Keep the media catalogue cached; each browser chooses its own display order. */
export async function HeroMediaMarquee(_props: { locale: string }) {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('media')
    .select('id, url, width, height')
    .like('mime_type', 'image/%')
    .order('created_at', { ascending: false })
    .limit(24)

  if (!data?.length) return null
  const catalogueKey = data.map(image => `${image.id}:${image.url}:${image.width}:${image.height}`).join('|')
  return <HeroMediaMarqueeClient key={catalogueKey} images={data} />
}
