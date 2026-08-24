import { DIFFICULTY_LABELS, type Difficulty } from '@/lib/quiz'

/** Tone comes from the theme's chart ramp, so it works in both modes. */
const TONE: Record<Difficulty, string> = {
  easy: 'text-chart-2 border-chart-2/40',
  medium: 'text-chart-1 border-chart-1/40',
  hard: 'text-destructive border-destructive/40',
}

export function DifficultyBadge({
  difficulty,
  locale,
}: {
  difficulty: Difficulty
  locale: string
}) {
  const label = DIFFICULTY_LABELS[difficulty]?.[locale === 'uz' ? 'uz' : 'en'] ?? difficulty
  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 text-[11px] font-medium ${TONE[difficulty] ?? TONE.easy}`}
      style={{ borderRadius: 999 }}
    >
      {label}
    </span>
  )
}
