import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ArticlePreview } from './ArticlePreview'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Article preview · Muhandiss.uz', robots: { index: false, follow: false } }

export default async function PreviewPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ draft?: string }> }) {
  const [{ locale }, { draft }] = await Promise.all([params, searchParams])
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/admin/login')
  if (!process.env.ADMIN_EMAIL || user.email !== process.env.ADMIN_EMAIL || !draft || !/^[a-f0-9-]{36}$/i.test(draft)) notFound()
  return <ArticlePreview token={draft} locale={locale} />
}
