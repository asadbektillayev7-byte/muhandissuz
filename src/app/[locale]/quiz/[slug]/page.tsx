import Link from 'next/link'
import { notFound } from 'next/navigation'
import { field } from '@/lib/supabase/locale'
import { effectiveDuration } from '@/lib/quiz'
import { getQuizBySlug, getQuizQuestions, getQuizArticles } from '@/lib/supabase/quiz-queries'
import { DifficultyBadge } from '@/components/quiz/DifficultyBadge'
import { CategoryChip } from '@/components/quiz/CategoryChip'
import { QuizRunner } from '../QuizRunner'

// Public content: served from cache and rebuilt in the background, so a
// navigation does not wait on a server render plus a database round-trip.
// Next only accepts a literal here, so the shared PUBLIC_REVALIDATE in
// lib/supabase/public.ts documents the value rather than supplying it.
export const revalidate = 600

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params

  const quiz = await getQuizBySlug(slug)
  if (!quiz) notFound()

  const [questions, articles] = await Promise.all([
    getQuizQuestions(quiz.id),
    getQuizArticles(quiz.id),
  ])

  const uz = locale === 'uz'
  const t = uz
    ? { back: '← Barcha quizlar', q: 'savol', min: 'daqiqa', based: 'Ushbu maqolalar asosida', soon: 'Savollar tayyorlanmoqda' }
    : { back: '← All quizzes', q: 'questions', min: 'minutes', based: 'Based on these articles', soon: 'Questions are being prepared' }

  const title = field(quiz, 'title', locale)
  const description = field(quiz, 'description', locale)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href={`/${locale}/quiz`} className="text-sm text-muted-foreground hover:text-chart-2">
        {t.back}
      </Link>

      <header className="mb-8 mt-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {quiz.categories && (
            <CategoryChip as="span" label={field(quiz.categories, 'name', locale)} />
          )}
          <DifficultyBadge difficulty={quiz.difficulty} locale={locale} />
        </div>

        <h1 className="text-3xl font-bold leading-tight">{title}</h1>
        {description && <p className="mt-3 text-muted-foreground">{description}</p>}

        <p className="mt-3 text-sm text-muted-foreground">
          {questions.length} {t.q} · {effectiveDuration(quiz, questions.length)} {t.min}
        </p>
      </header>

      {questions.length > 0 ? (
        <QuizRunner questions={questions as any} locale={locale} />
      ) : (
        <p className="border p-8 text-center text-muted-foreground" style={{ borderRadius: 20, borderColor: 'var(--border)' }}>
          {t.soon}
        </p>
      )}

      {articles.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t.based}
          </h2>
          <ul className="space-y-2">
            {articles.map((a: any) => (
              <li key={a.id}>
                <Link
                  href={`/${locale}/articles/${a.slug}`}
                  className="text-sm text-chart-2 hover:underline"
                >
                  {field(a, 'title', locale)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
