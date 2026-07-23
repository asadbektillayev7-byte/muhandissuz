import { getCategoriesList } from '@/lib/supabase/queries'
import { QuizCardStack } from './QuizCardStack'

export default async function QuizPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const categories = await getCategoriesList()

  const label = locale === 'uz'
    ? { title: 'Quiz', subtitle: 'O\'z bilimingizni sinab ko\'ring' }
    : { title: 'Quiz', subtitle: 'Test your engineering knowledge' }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">{label.title}</h1>
      <p className="text-muted-foreground mb-8">{label.subtitle}</p>

      <QuizCardStack categories={categories} locale={locale} />
    </div>
  )
}
