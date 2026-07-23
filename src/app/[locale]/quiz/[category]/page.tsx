import { createClient } from '@/lib/supabase/server'
import { field } from '@/lib/supabase/locale'
import { notFound } from 'next/navigation'

export default async function CategoryQuizPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>
}) {
  const { locale, category } = await params
  const supabase = await createClient()

  const { data: cat } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', category)
    .single()

  if (!cat) notFound()

  const name = field(cat, 'name', locale)

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">{name} — Quiz</h1>
      <p className="text-lg text-muted-foreground mb-2">Coming soon</p>
      <p className="text-sm text-muted-foreground/60">Questions and answers are being prepared</p>
    </div>
  )
}
