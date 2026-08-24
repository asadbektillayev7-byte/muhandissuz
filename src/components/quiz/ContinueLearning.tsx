'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { readArticleHistory, type QuizWithMeta } from '@/lib/quiz'
import { QuizThumbnail } from './QuizThumbnail'
import { surface } from './surface'

/**
 * Reads the local article history and surfaces quizzes linked to what the
 * visitor actually read. Entirely client-side — nothing is sent anywhere.
 * Renders nothing when there's no history or no matching quiz.
 */
export function ContinueLearning({
  quizzes,
  quizArticleMap,
  articleTitles,
  locale,
}: {
  quizzes: QuizWithMeta[]
  /** quiz id -> article ids it was built from */
  quizArticleMap: Record<number, number[]>
  /** article id -> localised title */
  articleTitles: Record<number, { uz: string; en: string | null }>
  locale: string
}) {
  const [matches, setMatches] = useState<{ quiz: QuizWithMeta; articleId: number }[]>([])

  useEffect(() => {
    const history = readArticleHistory()
    if (history.length === 0) return

    const readIds = history.map((h) => h.id)
    const found: { quiz: QuizWithMeta; articleId: number }[] = []

    for (const articleId of readIds) {
      for (const quiz of quizzes) {
        const linked = quizArticleMap[quiz.id] ?? []
        if (linked.includes(articleId) && !found.some((f) => f.quiz.id === quiz.id)) {
          found.push({ quiz, articleId })
        }
      }
    }

    setMatches(found.slice(0, 2))
  }, [quizzes, quizArticleMap])

  if (matches.length === 0) return null

  const t =
    locale === 'uz'
      ? { title: 'Maqoladan Davom Etish', based: 'Maqola asosida', cta: 'Quizni yechish', ready: 'O‘zingizni sinab ko‘rasizmi?' }
      : { title: 'Continue From Articles', based: 'Based on article', cta: 'Take Quiz', ready: 'Ready to test yourself?' }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{t.title}</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {matches.map(({ quiz, articleId }) => {
          const article = articleTitles[articleId]
          const articleTitle = article
            ? locale === 'uz'
              ? article.uz
              : article.en || article.uz
            : ''

          return (
            <Link
              key={quiz.id}
              href={`/${locale}/quiz/${quiz.slug}`}
              className="group flex items-center gap-4 border border-border bg-card p-4 transition-colors duration-150 hover:border-chart-2"
              style={{ borderRadius: 20, ...surface }}
            >
              <div className="w-24 shrink-0 overflow-hidden" style={{ borderRadius: 12 }}>
                <QuizThumbnail src={quiz.thumbnail_url} alt="" className="aspect-square" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{t.based}</p>
                <p className="truncate font-semibold">{articleTitle}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{t.ready}</p>
              </div>

              <span className="shrink-0 text-sm font-medium text-chart-2">{t.cta} →</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
