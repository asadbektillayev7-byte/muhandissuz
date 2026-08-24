'use client'

import { DIFFICULTIES, DIFFICULTY_LABELS, DURATION_BUCKETS, type Difficulty } from '@/lib/quiz'
import { CategoryChip } from './CategoryChip'
import { outline } from './surface'

export type Filters = {
  search: string
  category: string | null
  difficulty: Difficulty | null
  duration: string | null
}

export function QuizFilterBar({
  categories,
  filters,
  onChange,
  locale,
}: {
  categories: { id: number; slug: string; name_uz: string; name_en: string }[]
  filters: Filters
  onChange: (next: Filters) => void
  locale: string
}) {
  const uz = locale === 'uz'
  const t = uz
    ? { search: 'Quiz qidirish...', all: 'Barchasi', field: 'Yo‘nalish', difficulty: 'Daraja', duration: 'Davomiylik' }
    : { search: 'Search quizzes...', all: 'All', field: 'Field', difficulty: 'Difficulty', duration: 'Duration' }

  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch })

  return (
    <div
      className="sticky top-0 z-30 -mx-4 mb-8 border-b bg-background/85 px-4 py-4 backdrop-blur"
      style={outline}
      role="search"
    >
      <label className="sr-only" htmlFor="quiz-search">{t.search}</label>
      <input
        id="quiz-search"
        type="search"
        value={filters.search}
        onChange={(e) => set({ search: e.target.value })}
        placeholder={t.search}
        className="mb-4 w-full border border-border bg-transparent px-4 py-2.5 text-sm focus:border-chart-2 focus:outline-none"
        style={{ borderRadius: 999, ...outline }}
      />

      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs uppercase tracking-wider text-muted-foreground">{t.field}</span>
          <CategoryChip label={t.all} selected={filters.category === null} onClick={() => set({ category: null })} />
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              label={uz ? c.name_uz : c.name_en}
              selected={filters.category === c.slug}
              onClick={() => set({ category: filters.category === c.slug ? null : c.slug })}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs uppercase tracking-wider text-muted-foreground">{t.difficulty}</span>
          {DIFFICULTIES.map((d) => (
            <CategoryChip
              key={d}
              label={DIFFICULTY_LABELS[d][uz ? 'uz' : 'en']}
              selected={filters.difficulty === d}
              onClick={() => set({ difficulty: filters.difficulty === d ? null : d })}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs uppercase tracking-wider text-muted-foreground">{t.duration}</span>
          {DURATION_BUCKETS.map((b) => (
            <CategoryChip
              key={b.key}
              label={uz ? b.uz : b.en}
              selected={filters.duration === b.key}
              onClick={() => set({ duration: filters.duration === b.key ? null : b.key })}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
