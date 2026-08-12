import { createClient } from '@/lib/supabase/server'
import { field } from '@/lib/supabase/locale'
import { notFound } from 'next/navigation'
import { QuizRunner } from '../QuizRunner'

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

  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('category_id', cat.id)
    .order('sort_order')

  const name = field(cat, 'name', locale)

  if (!questions?.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">{name} — Quiz</h1>
        <p className="text-lg text-muted-foreground mb-2">
          {locale === 'uz' ? 'Tez kunda' : 'Coming soon'}
        </p>
        <p className="text-sm text-muted-foreground/60">
          {locale === 'uz'
            ? 'Savollar va javoblar tayyorlanmoqda'
            : 'Questions and answers are being prepared'}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{name} — Quiz</h1>
      <QuizRunner questions={questions as any} locale={locale} />
    </div>
  )
}
