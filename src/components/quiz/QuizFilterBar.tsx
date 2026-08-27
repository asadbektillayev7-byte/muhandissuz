'use client'

import { DIFFICULTIES, DIFFICULTY_LABELS, type Difficulty } from '@/lib/quiz'
import { outline } from './surface'

export type Filters = {
  search: string
  category: string | null
  difficulty: Difficulty | null
}

/** Native select, restyled to sit quietly next to the search field. */
function Dropdown({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <label className="sr-only">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-full appearance-none border bg-transparent py-2.5 pl-4 pr-9 text-sm text-foreground transition-colors duration-150 hover:border-foreground/40 focus:border-chart-2 focus:outline-none sm:w-auto"
        style={{ borderRadius: 999, ...outline }}
      >
        {children}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
      >
        ▾
      </span>
    </div>
  )
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
    ? { search: 'Quiz qidirish...', allFields: 'Yo‘nalish', allLevels: 'Daraja', field: 'Yo‘nalish', difficulty: 'Daraja' }
    : { search: 'Search quizzes...', allFields: 'Disciplines', allLevels: 'Levels', field: 'Discipline', difficulty: 'Difficulty' }

  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch })

  return (
    <div
      className="sticky top-0 z-30 -mx-4 mb-8 border-b bg-background/85 px-4 py-4 backdrop-blur"
      style={outline}
      role="search"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor="quiz-search">{t.search}</label>
        <input
          id="quiz-search"
          type="search"
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder={t.search}
          className="w-full flex-1 border bg-transparent px-4 py-2.5 text-sm transition-colors duration-150 hover:border-foreground/40 focus:border-chart-2 focus:outline-none"
          style={{ borderRadius: 999, ...outline }}
        />

        <div className="flex gap-3">
          <Dropdown
            label={t.field}
            value={filters.category ?? ''}
            onChange={(v) => set({ category: v || null })}
          >
            <option value="">{t.allFields}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {uz ? c.name_uz : c.name_en}
              </option>
            ))}
          </Dropdown>

          <Dropdown
            label={t.difficulty}
            value={filters.difficulty ?? ''}
            onChange={(v) => set({ difficulty: (v || null) as Difficulty | null })}
          >
            <option value="">{t.allLevels}</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {DIFFICULTY_LABELS[d][uz ? 'uz' : 'en']}
              </option>
            ))}
          </Dropdown>
        </div>
      </div>
    </div>
  )
}
