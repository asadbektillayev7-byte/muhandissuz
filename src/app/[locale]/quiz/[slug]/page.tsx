import Link from 'next/link'
import { notFound } from 'next/navigation'
import { field } from '@/lib/supabase/locale'
import { effectiveDuration } from '@/lib/quiz'
import { getQuizBySlug, getQuizQuestions, getQuizArticles } from '@/lib/supabase/quiz-queries'
import { CategoryChip } from '@/components/quiz/CategoryChip'
import { QuizThumbnail } from '@/components/quiz/QuizThumbnail'
import styles from '@/components/quiz/quiz-player.module.css'
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
    <div className={styles.page}>
      <Link href={`/${locale}/quiz`} className={styles.backLink}>
        {t.back}
      </Link>

      <header className={styles.detailHeader}>
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {quiz.categories && (
              <CategoryChip as="span" label={field(quiz.categories, 'name', locale)} />
            )}
          </div>

          <h1 className={styles.detailTitle}>{title}</h1>
          {description && <p className={styles.detailDescription}>{description}</p>}

          <p className={styles.detailMeta}>
            {questions.length} {t.q} · {effectiveDuration(quiz, questions.length)} {t.min}
          </p>
        </div>
        <div className={styles.detailArt} aria-hidden="true">
          <QuizThumbnail src={quiz.thumbnail_url} alt="" category={quiz.categories?.slug} className="aspect-square" />
        </div>
      </header>

      {questions.length > 0 ? (
        <QuizRunner questions={questions as any} locale={locale} />
      ) : (
        <p className="border p-8 text-center text-muted-foreground" style={{ borderRadius: 20, borderColor: 'var(--border)' }}>
          {t.soon}
        </p>
      )}

      {articles.length > 0 && (
        <section className={styles.reading}>
          <h2 className={styles.readingTitle}>
            {t.based}
          </h2>
          <ul className="space-y-2">
            {articles.map((a: any) => (
              <li key={a.id}>
                <Link
                  href={`/${locale}/articles/${a.slug}`}
                  className={styles.articleLink}
                >
                  <span>{field(a, 'title', locale)}</span><span aria-hidden="true">↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
