import { surface } from './surface'

/**
 * Real counts only — quizzes, engineering fields, linked articles and
 * questions. Attempts are deliberately absent until that feature exists.
 * A zero value hides its tile rather than advertising an empty section.
 */
export function QuizStats({
  stats,
  locale,
}: {
  stats: { quizzes: number; fields: number; articles: number; questions: number }
  locale: string
}) {
  const uz = locale === 'uz'
  const tiles = [
    { value: stats.quizzes, label: uz ? 'Quizlar' : 'Quizzes' },
    { value: stats.fields, label: uz ? 'Yo‘nalishlar' : 'Fields' },
    { value: stats.articles, label: uz ? 'Bog‘langan maqolalar' : 'Linked articles' },
    { value: stats.questions, label: uz ? 'Savollar' : 'Questions' },
  ].filter((t) => t.value > 0)

  if (tiles.length === 0) return null

  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="border border-border bg-card px-4 py-5 text-center"
          style={{ borderRadius: 20, ...surface }}
        >
          <div className="text-2xl font-bold text-chart-2">{t.value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{t.label}</div>
        </div>
      ))}
    </section>
  )
}
