'use client'

import { useMemo, useState } from 'react'
import { DURATION_BUCKETS, effectiveDuration, type QuizWithMeta } from '@/lib/quiz'
import { QuizHero } from './QuizHero'
import { QuizFilterBar, type Filters } from './QuizFilterBar'
import { FeaturedQuiz } from './FeaturedQuiz'
import { QuizGrid } from './QuizGrid'
import { EmptyQuizState } from './EmptyQuizState'
import { ContinueLearning } from './ContinueLearning'
import { QuizStats } from './QuizStats'

const EMPTY: Filters = { search: '', category: null, difficulty: null, duration: null }

export function QuizBrowser({
  quizzes,
  categories,
  stats,
  quizArticleMap,
  articleTitles,
  locale,
}: {
  quizzes: QuizWithMeta[]
  categories: { id: number; slug: string; name_uz: string; name_en: string }[]
  stats: { quizzes: number; fields: number; articles: number; questions: number }
  quizArticleMap: Record<number, number[]>
  articleTitles: Record<number, { uz: string; en: string | null }>
  locale: string
}) {
  const [filters, setFilters] = useState<Filters>(EMPTY)
  const isFiltering =
    filters.search.trim() !== '' || !!filters.category || !!filters.difficulty || !!filters.duration

  const results = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return quizzes.filter((quiz) => {
      if (filters.category && quiz.categories?.slug !== filters.category) return false
      if (filters.difficulty && quiz.difficulty !== filters.difficulty) return false

      if (filters.duration) {
        const bucket = DURATION_BUCKETS.find((b) => b.key === filters.duration)
        if (bucket && !bucket.test(effectiveDuration(quiz, quiz.questionCount))) return false
      }

      if (q) {
        const haystack = [
          quiz.title_uz,
          quiz.title_en,
          quiz.description_uz,
          quiz.description_en,
          quiz.categories?.name_uz,
          quiz.categories?.name_en,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }

      return true
    })
  }, [quizzes, filters])

  // Only headline a quiz when the visitor hasn't started narrowing things down.
  const featured = !isFiltering && results.length > 0 ? results[0] : null
  const gridItems = featured ? results.slice(1) : results

  const t = locale === 'uz' ? { library: 'Barcha quizlar' } : { library: 'All quizzes' }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <QuizHero locale={locale} />

      <QuizFilterBar
        categories={categories}
        filters={filters}
        onChange={setFilters}
        locale={locale}
      />

      <div className="space-y-12">
        {featured && <FeaturedQuiz quiz={featured} locale={locale} />}

        {results.length === 0 ? (
          <EmptyQuizState locale={locale} onReset={() => setFilters(EMPTY)} />
        ) : (
          gridItems.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">{t.library}</h2>
              <QuizGrid quizzes={gridItems} locale={locale} />
            </section>
          )
        )}

        <ContinueLearning
          quizzes={quizzes}
          quizArticleMap={quizArticleMap}
          articleTitles={articleTitles}
          locale={locale}
        />

        <QuizStats stats={stats} locale={locale} />
      </div>
    </div>
  )
}
