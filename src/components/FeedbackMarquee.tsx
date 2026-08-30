import { createPublicClient } from '@/lib/supabase/public'
import { FeedbackMarqueeClient } from './FeedbackMarqueeClient'

/**
 * Real visitor feedback, approved in the admin panel. Name and message only —
 * no rating, role or avatar. Renders nothing until something is approved.
 */
export async function FeedbackMarquee({ locale }: { locale: string }) {
  const supabase = createPublicClient()
  const { data: items } = await supabase
    .from('feedback')
    .select('id, name, message')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(20)

  if (!items?.length) return null

  return <FeedbackMarqueeClient items={items as any} locale={locale} />
}
